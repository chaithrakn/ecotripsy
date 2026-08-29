import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  const env = { ...process.env }
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match) env[match[1]] = match[2].trim()
    }
  }
  return env
}

const env = loadEnv()
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY
const SITE_URL = env.VITE_SITE_URL || 'https://greenlugg.vercel.app'

const STATIC_ROUTES = ['/', '/plan-a-trip', '/journal', '/about', '/partner']

async function fetchTable(table, columns) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return []
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}&published=eq.true`
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  })
  if (!res.ok) {
    console.warn(`Sitemap: failed to fetch ${table} (${res.status}), skipping.`)
    return []
  }
  return res.json()
}

function urlEntry(loc, lastmod) {
  return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}\n  </url>`
}

async function main() {
  const [articles, journalEntries] = await Promise.all([
    fetchTable('content_pages', 'slug,created_at'),
    fetchTable('journal_entries', 'slug,created_at')
  ])

  const entries = [
    ...STATIC_ROUTES.map(route => urlEntry(`${SITE_URL}${route}`)),
    ...articles.map(a => urlEntry(`${SITE_URL}/articles/${a.slug}`, a.created_at)),
    ...journalEntries.map(j => urlEntry(`${SITE_URL}/journal/${j.slug}`, j.created_at))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
  fs.writeFileSync(outPath, xml)
  console.log(`Sitemap written to ${outPath} (${entries.length} URLs).`)
}

main().catch(err => {
  console.error('Failed to generate sitemap:', err)
  process.exit(0)
})
