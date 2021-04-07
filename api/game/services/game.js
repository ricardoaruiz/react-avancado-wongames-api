'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

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

module.exports = {
  populate: async (params) => {
    console.log('Chamando o serviço pouplate...')

    const url = `https://www.gog.com/games/ajax/filtered?mediaType=game&page=1&sort=popularity`
    const {data: {products}} = await axios.get(url);

    console.log('product ==>', await getGameInfo(products[0].slug))
  }
};
