import useIsMobile from '../hooks/useIsMobile'

export default function AboutPage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: isMobile ? '48px 20px 64px' : '64px 40px 96px' }}>
      <h1 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: isMobile ? '28px' : '36px', fontWeight: 500, color: '#111827', margin: '0 0 20px' }}>
        About Greenlugg
      </h1>
      <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.8, margin: '0 0 16px' }}>
        At Greenlugg, we are passionate about preserving the environments and communities we travel through. We are building the ecosystem to curate the world's best sustainable and regenerative hotels and experiences, to make your travel more meaningful.
      </p>
      <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.8 }}>
        More about our story is coming soon.
      </p>
    </div>
  )
}
