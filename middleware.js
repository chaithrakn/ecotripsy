const BOT_UA_REGEX = /bot|crawl|spider|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|embedly|quora link preview|pinterest|redditbot|applebot|bingpreview|google-inspectiontool/i

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const SITE_URL = process.env.VITE_SITE_URL || 'https://www.greenlugg.com'

export const config = {
  matcher: ['/articles/:path*', '/journal/:path*', '/plan-a-trip', '/about', '/partner']
}

const STATIC_PAGES = {
  '/plan-a-trip': {
    title: 'Sustainable Travel Itineraries',
    description: 'Browse curated sustainable travel itineraries by destination — build a trip with hand-picked eco-hotels, responsible tours and regenerative experiences.'
  },
  '/about': {
    title: 'About',
    description: "Greenlugg curates sustainable and regenerative travel — handpicked hotels, tours and experiences selected for community benefit, conservation and regeneration."
  },
  '/partner': {
    title: 'Partner With Us',
    description: 'Run a sustainable hotel, tour company or experience? Partner with Greenlugg to reach travelers looking for responsible, regenerative travel.'
  },
  '/journal': {
    title: 'Field Notes — Sustainable Travel Stories',
    description: 'Stories, guides and reflections on sustainable and responsible travel from destinations around the world.'
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function cleanDescription(text) {
  if (!text) return ''
  const plain = text.replace(/[#*_`>[\]()]/g, '').replace(/\s+/g, ' ').trim()
  return plain.length > 160 ? `${plain.slice(0, 157)}...` : plain
}

async function fetchRow(table, slug, columns) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const url = `${SUPABASE_URL}/rest/v1/${table}?slug=eq.${encodeURIComponent(slug)}&select=${columns}&published=eq.true`
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  })
  if (!res.ok) return null
  const data = await res.json()
  return data[0] || null
}

function buildBreadcrumbItems({ country, title, url }) {
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${SITE_URL}/` }
  ]
  if (country) {
    items.push({ '@type': 'ListItem', position: items.length + 1, name: country })
  }
  items.push({ '@type': 'ListItem', position: items.length + 1, name: title, item: url })
  return items
}

function renderBreadcrumbNav(breadcrumbItems) {
  if (!breadcrumbItems) return ''
  const parts = breadcrumbItems.map(item =>
    item.item
      ? `<a href="${escapeHtml(item.item)}">${escapeHtml(item.name)}</a>`
      : escapeHtml(item.name)
  )
  return `<nav aria-label="Breadcrumb">${parts.join(' / ')}</nav>`
}

function renderHtml({ title, description, image, url, type, structuredData, breadcrumbItems }) {
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeImage = image ? escapeHtml(image) : null

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeTitle} | Greenlugg</title>
<meta name="description" content="${safeDescription}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="${type}" />
<meta property="og:site_name" content="Greenlugg" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:url" content="${url}" />
${safeImage ? `<meta property="og:image" content="${safeImage}" />` : ''}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />
${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}
${structuredData ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ''}
</head>
<body>
${renderBreadcrumbNav(breadcrumbItems)}
<h1>${safeTitle}</h1>
<p>${safeDescription}</p>
</body>
</html>`
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || ''
  if (!BOT_UA_REGEX.test(userAgent)) {
    return
  }

  const url = new URL(request.url)

  const staticPage = STATIC_PAGES[url.pathname]
  if (staticPage) {
    const html = renderHtml({
      title: staticPage.title,
      description: staticPage.description,
      image: null,
      url: `${SITE_URL}${url.pathname}`,
      type: 'website'
    })
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    })
  }

  const articleMatch = url.pathname.match(/^\/articles\/([^/]+)\/?$/)
  const journalMatch = url.pathname.match(/^\/journal\/([^/]+)\/?$/)

  let row = null
  let type = 'article'

  if (articleMatch) {
    row = await fetchRow(
      'content_pages',
      articleMatch[1],
      'title,excerpt,intro,cover_image,created_at,destinations(countries(name)),regions(destinations(countries(name)))'
    )
  } else if (journalMatch) {
    row = await fetchRow('journal_entries', journalMatch[1], 'title,excerpt,cover_image,created_at')
    type = 'article'
  }

  if (!row) {
    return
  }

  const pageUrl = `${SITE_URL}${url.pathname}`
  const title = row.title
  const description = cleanDescription(row.excerpt || row.intro)
  const country = row.destinations?.countries?.name || row.regions?.destinations?.countries?.name || null

  const breadcrumbItems = articleMatch ? buildBreadcrumbItems({ country, title, url: pageUrl }) : null

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: row.cover_image,
      datePublished: row.created_at,
      author: { '@type': 'Organization', name: 'Greenlugg' },
      publisher: {
        '@type': 'Organization',
        name: 'Greenlugg',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/greenlugg-mark.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }
    },
    ...(breadcrumbItems ? [{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    }] : [])
  ]

  const html = renderHtml({
    title,
    description,
    image: row.cover_image,
    url: pageUrl,
    type,
    structuredData,
    breadcrumbItems
  })

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  })
}
