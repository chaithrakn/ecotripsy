import middleware from '../middleware.js'

const slug = process.argv[2] || 'top-10-biohotels-italian-dolomites'
const request = new Request(`https://www.greenlugg.com/articles/${slug}`, {
  headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
})

const response = await middleware(request)
if (!response) {
  console.log('No response — middleware passed through (row not found, or not a bot).')
} else {
  console.log(await response.text())
}
