import { useState } from 'react'

function ChevronIcon({ expanded }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
      style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flexShrink: 0 }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function CollapsibleSection({ id, heading, defaultExpanded = true, children }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div id={id} style={{ marginBottom: '24px', scrollMarginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          {heading}
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          aria-label={expanded ? 'Collapse section' : 'Expand section'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '999px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
        >
          <ChevronIcon expanded={expanded} />
        </button>
      </div>
      {expanded && <div style={{ marginTop: '8px' }}>{children}</div>}
    </div>
  )
}
