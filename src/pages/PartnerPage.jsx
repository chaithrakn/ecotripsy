import useIsMobile from '../hooks/useIsMobile'

export default function PartnerPage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: isMobile ? '48px 20px 64px' : '64px 40px 96px' }}>
      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 500, color: '#111827', margin: '0 0 20px' }}>
        Partner with us
      </h1>
      <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.8, margin: '0 0 16px' }}>
        Run a sustainable hotel, tour company, or experience? We'd love to hear from you. Partner details and an application form are coming soon.
      </p>
    </div>
  )
}
