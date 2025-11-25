require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY; // tu clave en .env

app.get('/search', async function(req, res) {
var keyword = req.query.keyword;

var targetUrl = 'https://www.workana.com/jobs?language=es';
if (keyword) {
    targetUrl += '&query=' + encodeURIComponent(keyword);
}

try {
    var apiUrl = 'http://api.scraperapi.com/';
    var params = {
        api_key: SCRAPERAPI_KEY,
        url: targetUrl,
        render: 'false'
    };

    var response = await axios.get(apiUrl, { params: params });
    var html = response.data;
    var $ = cheerio.load(html);
    var results = [];

    $('h2').each(function(i, el) {
        var title = $(el).text().trim();
        if (!title) return;

        var container = $(el).parent();
        var desc = container.find('div').eq(1).text().trim();

        var link = container.find('a').last().attr('href');
        var fullUrl = '';
        if (link) {
            if (link.indexOf('http') === 0) fullUrl = link;
            else fullUrl = 'https://www.workana.com' + link;
        }

        results.push({
            title: title,
            description: desc || 'Sin descripción',
            url: fullUrl
        });
    });

    res.json(results);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed', details: err.message });
}

});

app.listen(PORT, function() {
console.log('Server on ' + PORT);
});
