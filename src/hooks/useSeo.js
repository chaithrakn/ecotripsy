import { useEffect } from 'react'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://greenlugg.vercel.app'
const SITE_NAME = 'Greenlugg'

function setMetaTag(attr, value, content) {
  let tag = document.querySelector(`meta[${attr}="${value}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, value)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function cleanDescription(text) {
  if (!text) return null
  const plain = text.replace(/[#*_`>[\]()]/g, '').replace(/\s+/g, ' ').trim()
  return plain.length > 160 ? `${plain.slice(0, 157)}...` : plain
}

function setCanonical(path) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', `${SITE_URL}${path}`)
}

export default function useSeo({ title, description, path, noIndex = false }) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME

    const cleanedDescription = cleanDescription(description)
    if (cleanedDescription) {
      setMetaTag('name', 'description', cleanedDescription)
    }

    if (path != null) {
      setCanonical(path)
    }

    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
  }, [title, description, path, noIndex])
}
