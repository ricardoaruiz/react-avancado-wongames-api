'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const slugify = require('slugify')
const axios = require('axios');

/**
 * Get Game info from GOG page game detail
 * @param {*} slug
 */
const getGameInfo = async (slug) => {
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
  const foundEntry = await getEntryByName(name, entityName)
  if (!foundEntry) {
    await strapi.services[entityName].create({ name, slug: slugify(name, { lower: true }) })
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
  const foundEntry = await getEntryByName(product.title, 'game');

  if(!foundEntry) {
    console.info(`Creating: ${product.title}`)
    const { rating, short_description, description } = await getGameInfo(product.slug);
    const { title: name, slug, price: { amount: price }, globalReleaseDate, genres, supportedOperatingSystems, publisher, developer } = product;

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

    await strapi.services.game.create(game);
  }

}

module.exports = {
  /**
   * Populate all collections
   * @param {*} params
   */
  populate: async (params) => {
    console.log('Starting populate collections...')

    const url = `https://www.gog.com/games/ajax/filtered?mediaType=game&page=1&sort=popularity`
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
