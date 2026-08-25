export const PILLARS = [
  {
    key: 'Grow',
    eyebrow: 'GROW',
    title: 'Farm, Food & Land',
    description: 'Farm stays, agritourism, cooking with locals.',
    color: '#3B6D11',
    bg: '#EAF3DE'
  },
  {
    key: 'Explore',
    eyebrow: 'EXPLORE',
    title: 'Nature & Adventure',
    description: 'Trekking, wilderness, off-grid stays, glaciers, dark skies.',
    color: '#534AB7',
    bg: '#EEEDFE'
  },
  {
    key: 'Connect',
    eyebrow: 'CONNECT',
    title: 'Community & Culture',
    description: 'Village life, craft traditions, community-owned lodges, indigenous culture.',
    color: '#854F0B',
    bg: '#FAEEDA'
  },
  {
    key: 'Protect',
    eyebrow: 'PROTECT',
    title: 'Conservation',
    description: 'Wildlife sanctuaries, marine protection, reforestation, conservation lodges.',
    color: '#185FA5',
    bg: '#E6F1FB'
  },
  {
    key: 'Restore',
    eyebrow: 'RESTORE',
    title: 'Wellness & Healing',
    description: 'Yoga retreats, thermal baths, ayurveda, rituals.',
    color: '#0F6E56',
    bg: '#E1F5EE'
  }
]

export const PILLAR_COLORS = Object.fromEntries(
  PILLARS.map(p => [p.key, { bg: p.bg, color: p.color }])
)
