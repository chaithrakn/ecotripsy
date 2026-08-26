import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  {
    label: 'Saved',
    path: '/saved',
    icon: <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.5 6.6 4.3 5c2.3-1.3 4.9-.6 6.3 1.3l1.4 1.9 1.4-1.9c1.4-1.9 4-2.6 6.3-1.3 2.8 1.6 3.3 5.1 1.6 7.9C18.7 16.65 12 21 12 21z" />
  },
  {
    label: 'Trips',
    path: '/trips',
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </>
    )
  },
  {
    label: 'Explore',
    path: '/plan-a-trip',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m14.5 9.5-1.5 5-5 1.5 1.5-5z" />
      </>
    )
  }
]

const LOGOUT_ICON = (
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </>
)

function RailRow({ active, danger, onClick, icon, label }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
        backgroundColor: active ? '#f0faf6' : 'transparent',
        color: danger ? '#ef4444' : active ? '#0F2E1D' : '#374151',
        marginBottom: '4px'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
      <span style={{ fontSize: '15px', fontWeight: active ? 600 : 500 }}>{label}</span>
    </div>
  )
}

export function AccountNavLinks() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      {NAV_ITEMS.map(item => (
        <RailRow
          key={item.label}
          active={location.pathname === item.path}
          onClick={() => navigate(item.path)}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </>
  )
}

export function LogoutButton() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return <RailRow danger onClick={handleLogout} icon={LOGOUT_ICON} label="Logout" />
}

export default function AccountRail() {
  return (
    <div style={{
      width: '260px', flexShrink: 0, borderRight: '1px solid #e5e4e0', padding: '24px 16px',
      height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      <AccountNavLinks />
      <div style={{ marginTop: 'auto' }}>
        <LogoutButton />
      </div>
    </div>
  )
}
