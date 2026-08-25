import { Link } from 'react-router-dom'
import { ENTITIES } from '../../lib/admin/entityConfigs'

export default function AdminHome() {
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>Admin</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ENTITIES.map(entity => (
          <Link
            key={entity.table}
            to={`/admin/${entity.table}`}
            style={{ fontSize: '15px', color: '#0F2E1D', fontWeight: 600, textDecoration: 'none' }}
          >
            Manage {entity.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}
