import { Link, Outlet, useLocation } from 'react-router-dom'
import { ENTITIES } from '../../lib/admin/entityConfigs'
import useSeo from '../../hooks/useSeo'

export default function AdminLayout() {
  const location = useLocation()
  useSeo({ title: 'Admin', path: location.pathname, noIndex: true })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid #f3f4f6', padding: '24px 16px' }}>
        <Link to="/admin" style={{ display: 'block', fontWeight: 700, fontSize: '16px', marginBottom: '24px', color: '#111827', textDecoration: 'none' }}>
          Admin
        </Link>
        {ENTITIES.map(entity => (
          <Link
            key={entity.table}
            to={`/admin/${entity.table}`}
            style={{ display: 'block', padding: '8px 0', fontSize: '14px', color: '#374151', textDecoration: 'none' }}
          >
            {entity.label}
          </Link>
        ))}
        <Link
          to="/admin/itinerary_templates"
          style={{ display: 'block', padding: '8px 0', fontSize: '14px', color: '#374151', textDecoration: 'none' }}
        >
          Itinerary Templates
        </Link>
        <Link
          to="/admin/content_pages"
          style={{ display: 'block', padding: '8px 0', fontSize: '14px', color: '#374151', textDecoration: 'none' }}
        >
          Articles
        </Link>
        <Link to="/" style={{ display: 'block', marginTop: '24px', fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>
          ← Back to site
        </Link>
      </div>
      <div style={{ flex: 1, padding: '32px 40px' }}>
        <Outlet />
      </div>
    </div>
  )
}
