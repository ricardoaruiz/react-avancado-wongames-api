'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const slugify = require('slugify')
const axios = require('axios');
const qs = require('querystring')

const Exception = (e) => {
  return { e, data: e.data && e.data.errors && e.data.errors };
}

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Set a image on a game
 * @param {*} param0
 */
const setImage = async ({ image, game, field = "cover" }) => {
  try {
    const url = `https:${image}_bg_crop_1680x655.jpg`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(data, "base64");

    const FormData = require("form-data");
    const formData = new FormData();

    formData.append("refId", game.id);
    formData.append("ref", "game");
    formData.append("field", field);
    formData.append("files", buffer, { filename: `${game.slug}.jpg` });

    console.info(`Uploading ${field} image: ${game.slug}.jpg`);
    console.info(`http://${strapi.config.host}:${strapi.config.port}/upload`);

    await axios({
      method: "POST",
      url: `http://${strapi.config.host}:${strapi.config.port}/upload`,
      data: formData,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      },
    });
  } catch(e) {
    console.log("setImage", Exception(e));
  }
}

/**
 * Get Game info from GOG page game detail
 * @param {*} slug
 */
const getGameInfo = async (slug) => {
  try {
    const jsdom = require('jsdom');
    const { JSDOM } = jsdom;
    const body = await axios.get(`https://www.gog.com/game/${slug}`);
    const dom = new JSDOM(body.data);
    const description = dom.window.document.querySelector('.description')

    return {
      rating: 'BR0',
      short_description: description.textContent.slice(0, 160),
      description: description.innerHTML
    }
  } catch(e) {
    console.log("getGameInfo", Exception(e));
  }
}

/**
 * Check if exist an entry by name
 * @param {*} name
 * @param {*} entityName
 * @returns true/false
 */
const getEntryByName = async (name, entityName) => {
  return strapi.services[entityName].findOne({ name })
}

/**
 * Create a entry
 * @param {*} name
 */
const createEntry = async (name, entityName) => {
  try {
    const foundEntry = await getEntryByName(name, entityName)
    if (!foundEntry) {
      await strapi.services[entityName].create({ name, slug: slugify(name, { lower: true }) })
    }
  } catch(e) {
    console.log("createEntry", Exception(e));
  }
}

/**
 * Create many entries
 * @param {*} values
 */
const createEntries = async (values, entityName) => {
  for(const value of values) {
    await createEntry(value, entityName)
  }
}

/**
 * Create a game
 * @param {*} product
 */
const createGame = async product => {
  try {
    const foundEntry = await getEntryByName(product.title, 'game');

    if(!foundEntry) {
      console.info(`Creating: ${product.title}`)
      const { rating, short_description, description } = await getGameInfo(product.slug);
      const {
        title: name,
        slug, price: { amount: price },
        globalReleaseDate,
        genres,
        supportedOperatingSystems,
        publisher,
        developer,
        image,
        gallery,
      } = product;

      const game = {
        name,
        slug: slug.replace(/_/g, '-'),
        short_description,
        description,
        price,
        release_date: new Date(Number(globalReleaseDate) * 1000).toISOString(),
        rating,
        categories: await Promise.all(genres.map(genre => getEntryByName(genre, 'category'))),
        publisher: await getEntryByName(publisher, 'publisher'),
        developers: [await getEntryByName(developer, 'developer')],
        platforms: await Promise.all(supportedOperatingSystems.map(platform => getEntryByName(platform, 'platform')))
      };

      const createdGame = await strapi.services.game.create(game);
      await setImage({image, game: createdGame})
      await Promise.all(
        gallery.slice(0, 5).map(url => setImage({ image: url, game: createdGame, field: 'gallery'}))
      );

      await timeout(2000);
    }
  } catch(e) {
    console.log("createGame", Exception(e));
  }

}

module.exports = {
  /**
   * Populate all collections
   * @param {*} params
   */
  populate: async (params) => {
    console.log('Starting populate collections...')

    const options = {
      sort: 'popularity',
      page: 1,
      ...params
    }

    const url = `https://www.gog.com/games/ajax/filtered?mediaType=game&${qs.stringify(options)}`
    const {data: {products}} = await axios.get(url);

    for(const product of products) {
      await createEntries(product.genres, 'category');
      await createEntry(product.publisher, 'publisher');
      await createEntry(product.developer, 'developer');
      await createEntries(product.supportedOperatingSystems, 'platform');
      await createGame(product);
    }

    console.log('Finishing populate collections.')
  }
};
