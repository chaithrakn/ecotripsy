# Greenlugg — Project Status

_Last updated: 2026-08-28_

A curated sustainable-travel platform: React + Vite frontend, Supabase (Postgres, Auth, Row-Level Security) backend, Leaflet maps. This document is a snapshot of what's built, what's thin, and what's worth doing next — not a spec for unbuilt work.

## At a glance

- **16** Postgres tables, all RLS-gated
- **8** content types editable from `/admin` (no hand-written SQL needed for routine changes)
- **4** saveable item types — hotels, tours, guides, itineraries
- **3** trip-building modes — single-region, multi-region combine, templated legs

## What's built

### Content & discovery
- Destinations → regions → hotels/attractions/tour companies, fully relational
- Long-form articles with a block editor (text, hotel lists, tour lists)
- Hotel lists filterable by pillar tag (any-match) and certification, sortable
- Field Notes — a separate blog-style long-read section

### Trip planning
- Day-by-day itinerary generator from authored templates
- Single-hotel, multi-region combine, and fixed-leg template modes
- Experiences add-on system — treks and multi-day extras layer onto a base trip as their own day-range block, with optional tour suggestions
- Interactive Leaflet map syncs with the itinerary as you hover

### Accounts & saving
- Email/password auth via Supabase, with a persistent account rail
- Save hotels, tours, guides and full itineraries
- Heart a thing while logged out — it queues, prompts login, then saves itself
- One shared card component (`EntityCard`) renders identically on the homepage, Saved, and Trips

### Admin CMS
- Generic form/list scaffold — add a config object, get a working editor
- Six entity types run on it today; two more (articles, itinerary templates) got bespoke editors
- Every write gated by Postgres RLS, scoped to signed-in (`authenticated`) users
- No more hand-written SQL for day-to-day content changes

### Growth & lead capture
- Footer newsletter signup (writes to `subscribers`)
- Auto-triggered, once-per-browser interest popup collecting name/email/role/pillar interests (writes to `interest_submissions`)

## Open questions / known gaps

| Area | Gap | Why it matters |
|---|---|---|
| Security | `/admin` has no access gate of its own | Any signed-up traveler account can currently reach `/admin` and edit live content — only an unguessed URL stands in the way. Worth closing soon. |
| Mobile | Saved/Trips unreachable on mobile | The account rail linking to them only renders on desktop widths. |
| Discovery | No per-page SEO | No `<title>`, meta description, or Open Graph tags per page — hurts organic search and social shares for a content-heavy site. |
| Auth | No forgot-password flow | A locked-out user has no self-service way back in. |
| Content ops | Attractions & trip templates are SQL-only | The last two content types not yet on the admin scaffold. |
| Performance | One ~830 KB JS bundle, no code-splitting | Admin routes, markdown renderer, and map library ship on every page load, even for anonymous visitors. |
| Quality | No automated tests | Verified so far only via type-check builds and manual click-through. |

## Recommendations

### Now — closes real gaps, days not weeks
- Real admin access control (an explicit admin flag, not just "any logged-in user")
- SEO fundamentals: per-page title, description, Open Graph tags
- Forgot-password flow
- Mobile nav parity for Saved/Trips

### Next — meaningful feature growth
- A public browse/search page for hotels and tours (currently only reachable via curated articles)
- Admin editors for Attractions and Trip Templates
- Real image uploads via Supabase Storage instead of pasted URLs
- Code-split the bundle (lazy-load `/admin`, map, markdown libs)

### Later — bigger bets, worth sequencing deliberately
- A real booking/affiliate path ("Book Now" currently just links out, no tracking)
- Reviews and ratings from travelers
- Personalization using the pillar-interest signal already being collected (saves + interest form)
- Newsletter send infrastructure + working unsubscribe
