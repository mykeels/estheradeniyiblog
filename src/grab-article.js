const axios = require('axios');
const cheerio = require('cheerio');

const relativeUrl  = process.env.URL || '';
const { urls } = require('./sitemap.json');