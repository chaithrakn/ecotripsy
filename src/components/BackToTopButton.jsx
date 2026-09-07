import { useState, useEffect } from 'react'

export default function BackToTopButton({ scrollContainerRef }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const containerTop = scrollContainerRef?.current?.scrollTop || 0
      const windowTop = window.scrollY || 0
      setVisible(Math.max(containerTop, windowTop) > 200)
    }
    const el = scrollContainerRef?.current
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    el?.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      el?.removeEventListener('scroll', handleScroll)
    }
  }, [scrollContainerRef])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    scrollContainerRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      style={{
        position: 'fixed', bottom: '24px', right: '24px', width: '44px', height: '44px',
        borderRadius: '999px', border: 'none', backgroundColor: '#0F2E1D', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)', zIndex: 60
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
