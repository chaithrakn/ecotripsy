export default function HeartButton({ saved, onClick, style }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick() }}
      aria-label={saved ? 'Unsave' : 'Save'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '32px', height: '32px', flexShrink: 0,
        backgroundColor: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        ...style
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? '#ef4444' : 'none'} stroke={saved ? '#ef4444' : '#374151'} strokeWidth="2">
        <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.5 6.6 4.3 5c2.3-1.3 4.9-.6 6.3 1.3l1.4 1.9 1.4-1.9c1.4-1.9 4-2.6 6.3-1.3 2.8 1.6 3.3 5.1 1.6 7.9C18.7 16.65 12 21 12 21z" />
      </svg>
    </button>
  )
}
