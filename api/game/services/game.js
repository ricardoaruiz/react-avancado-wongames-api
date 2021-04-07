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

const createPublisher = async product => {
  const { publisher: name } = product;
  const foundPublisher = await strapi.services.publisher.findOne({ name })
  if (!foundPublisher) {
    await strapi.services.publisher.create({ name, slug: slugify(name).toLowerCase()  })
  }
}

const createDeveloper = async product => {
  const { developer: name } = product;
  const foundDeveloper = await strapi.services.developer.findOne({ name })
  if (!foundDeveloper) {
    await strapi.services.developer.create({ name, slug: slugify(name).toLowerCase()  })
  }
}

module.exports = {
  populate: async (params) => {
    console.log('Iniciando o serviço populate...')

    const url = `https://www.gog.com/games/ajax/filtered?mediaType=game&page=1&sort=popularity`
    const {data: {products}} = await axios.get(url);

    for(const product of products) {
      await createPublisher(product);
      await createDeveloper(product);
    }

    console.log('Finalizando o serviço populate')
  }
};
