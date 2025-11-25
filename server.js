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
const keyword = req.query.keyword;
let targetUrl = '[https://www.workana.com/jobs?language=en%2Ces](https://www.workana.com/jobs?language=en%2Ces)';
if (keyword) targetUrl += '&query=' + encodeURIComponent(keyword);

```
try {
    const apiUrl = 'http://api.scraperapi.com/';
    const params = {
        api_key: SCRAPERAPI_KEY,
        url: targetUrl,
        render: 'false'
    };

    const response = await axios.get(apiUrl, { params });
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    $('h2').each(function(i, el) {
        const title = $(el).text().trim();
        if (!title) return;

        const container = $(el).parent();
        const desc = container.find('div').eq(1).text().trim();

        const link = container.find('a').last().attr('href');
        const fullUrl = link ? (link.indexOf('http') === 0 ? link : 'https://www.workana.com' + link) : '';

        results.push({
            title: title,
            description: desc || 'Sin descripción',
            url: fullUrl
        });
    });

    // fallback de ejemplo si no hay resultados
    if (results.length === 0) {
        results.push({
            title: 'Proyecto de ejemplo',
            description: 'Descripción de prueba',
            url: 'https://www.workana.com/'
        });
    }

    res.json(results);
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scraping failed', details: err.message });
}
```

});

app.listen(PORT, function() {
console.log('Server on ' + PORT);
});
