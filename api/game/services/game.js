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
const hasEntryWithName = async (name, entityName) => {
  const foundItem = await strapi.services[entityName].findOne({ name })
  return foundItem !== null
}

/**
 * Create a entry
 * @param {*} product
 */
const createEntry = async (data, entityName) => {
  const hasEntry = await hasEntryWithName(data.name, entityName)
  if (!hasEntry) {
    await strapi.services[entityName].create(data)
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
      await createEntry({ name: product.publisher, slug: slugify(product.publisher, { lower: true }) }, 'publisher');
      await createEntry({ name: product.category, slug: slugify(product.category, { lower: true }) }, 'category');
      await createEntry({ name: product.developer, slug: slugify(product.developer, { lower: true }) }, 'developer');
    }

    console.log('Finishing populate collections.')
  }
};
