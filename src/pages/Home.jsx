import { useNavigate } from 'react-router-dom'
import { destinations } from '../data/destinations'

/* const destinations = [
  {
    id: 'bali',
    title: 'Eco Stays in Bali',
    subtitle: '10 curated properties',
    image: 'https://plus.unsplash.com/premium_photo-1730035378601-e4b6183f3398?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    route: '/bali',
    available: true,
  },
  {
    id: 'dolomites',
    title: 'Biohotels in the Italian Dolomites',
    subtitle: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    route: '/dolomites',
    available: false,
  },
  {
    id: 'peru',
    title: 'Sustainable Stays in Peru',
    subtitle: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80',
    route: '/peru',
    available: false,
  },
  {
    id: 'portugal',
    title: 'Eco Hotels in Porto',
    subtitle: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
    route: '/portugal',
    available: false,
  },
  {
    id: 'costa-rica',
    title: 'Sustainable Paradise in Costa Rica',
    subtitle: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=800&q=80',
    route: '/costa-rica',
    available: false,
  },
  {
    id: 'morocco',
    title: 'Eco Stays in Morocco',
    subtitle: 'Coming soon',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
    route: '/morocco',
    available: false,
  },
] */

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '32px 40px 60px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}>
        {destinations.map((dest) => (
          <div
            key={dest.id}
            onClick={() => dest.available && navigate(dest.route)}
            style={{
              position: 'relative',
              width: '90%',
              margin: '0 auto',
              borderRadius: '12px',
              overflow: 'hidden',
              aspectRatio: '4/3',
              cursor: dest.available ? 'pointer' : 'default',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              if (dest.available) {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <img src={dest.image} alt={dest.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
            {!dest.available && (
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#374151', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.05em' }}>
                  COMING SOON
                </span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {dest.subtitle}
              </p>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
                {dest.title}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}