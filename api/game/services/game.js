'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const axios = require('axios');

module.exports = {
  populate: async (params) => {
    console.log('Chamando o serviço pouplate...')

    const url = `https://www.gog.com/games/ajax/filtered?mediaType=game&page=1&sort=popularity`
    const {data: {products}} = await axios.get(url);


    console.log('products ==>', products[0])
  }
};
