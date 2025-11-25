require('dotenv').config()
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()
app.use(cors())
const PORT = process.env.PORT || 3000

const SCRAPERAPI_KEY = process.env.SCRAPERAPI_KEY // set en .env

app.get('/search', async (req, res) => {
    const { keyword } = req.query
    const targetUrl = `https://www.workana.com/jobs?language=es${
        keyword ? '&query=' + encodeURIComponent(keyword) : ''
    }`

    try {
        // ScraperAPI example: http://api.scraperapi.com/?api_key=KEY&url=ENCODED_URL&render=true
        const apiUrl = 'http://api.scraperapi.com/'
        const params = {
            api_key: SCRAPERAPI_KEY,
            url: targetUrl,
            render: 'true', // renderizar JS si es necesario
        }

        const { data: html } = await axios.get(apiUrl, {
            params,
            timeout: 60000,
        })
        console.log("HTML recibido:", html)
        const $ = cheerio.load(html)

        const results = []
        $('.project-item').each((i, el) => {
            const title = $(el).find('.project-title span').text().trim()
            const desc =
                $(el).find('.expander').text().trim() || 'Sin descripción'
            const href = $(el).find('a').attr('href') || ''
            if (title) {
                results.push({
                    title,
                    description: desc,
                    url: href.startsWith('http')
                        ? href
                        : 'https://www.workana.com' + href,
                })
            }
        })

        res.json(results)
    } catch (err) {
        console.error(err.message || err)
        res.status(500).json({ error: 'Scraping failed', details: err.message })
    }
})

app.listen(PORT, () => console.log(`Server on ${PORT}`))

