import { useState } from 'react'
import HeartButton from './HeartButton'

export default function SavedCard({ image, title, subtitle, linkLabel, onOpen, onRemove }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: onOpen ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        padding: '12px',
        borderRadius: '18px',
        border: `1px solid ${hovered ? '#e5e4e0' : 'transparent'}`,
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', aspectRatio: '4/3', minWidth: 0, width: '100%', backgroundColor: '#eeece5' }}>
        {image && (
          <img src={image} alt={title} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <HeartButton saved onClick={onRemove} style={{ position: 'absolute', top: '10px', right: '10px' }} />
      </div>

      <h3 style={{ fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', fontSize: '21px', fontWeight: 600, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>
        {title}
      </h3>

      {subtitle && (
        <p style={{
          fontSize: '15px', color: '#6b7280', margin: '0 0 10px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {subtitle}
        </p>
      )}

      {onOpen && (
        <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '10px' }}>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onOpen() }}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0F2E1D',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {linkLabel || 'View'} →
          </button>
        </div>
      )}
    </div>
  )
}
