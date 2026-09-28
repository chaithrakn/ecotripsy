import { useState, useEffect } from 'react'
import { loadDestinationOptions, loadRegionOptionsForDestination } from '../../lib/admin/entityConfigs'
import { getHotelsByRegion } from '../../lib/supabase/api'

const AGENT_API = 'http://localhost:8000'

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }
const primaryButtonStyle = { padding: '10px 18px', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }
const sectionStyle = { marginBottom: '18px' }

function ChipPicker({ options, selected, onToggle, emptyLabel }) {
  if (!options.length) return <p style={{ fontSize: '13px', color: '#9ca3af' }}>{emptyLabel}</p>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {options.map(opt => {
        const isSelected = selected.includes(opt.value)
        return (
          <span
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              cursor: 'pointer',
              border: `1px solid ${isSelected ? '#0F2E1D' : '#d1d5db'}`,
              backgroundColor: isSelected ? '#0F2E1D' : 'white',
              color: isSelected ? 'white' : '#374151'
            }}
          >
            {opt.label}
          </span>
        )
      })}
    </div>
  )
}

export default function AgentPlayground() {
  const [destinationOptions, setDestinationOptions] = useState([])
  const [destinationId, setDestinationId] = useState('')
  const [regionOptions, setRegionOptions] = useState([])
  const [selectedRegionIds, setSelectedRegionIds] = useState([])
  const [hotelOptions, setHotelOptions] = useState([])
  const [selectedHotelIds, setSelectedHotelIds] = useState([])
  const [days, setDays] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [itinerary, setItinerary] = useState(null)

  useEffect(() => {
    loadDestinationOptions().then(setDestinationOptions).catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    setSelectedRegionIds([])
    setSelectedHotelIds([])
    setHotelOptions([])
    if (!destinationId) { setRegionOptions([]); return }
    loadRegionOptionsForDestination(destinationId).then(setRegionOptions).catch(err => setError(err.message))
  }, [destinationId])

  useEffect(() => {
    setSelectedHotelIds([])
    const regionIds = selectedRegionIds.length ? selectedRegionIds : regionOptions.map(r => r.value)
    if (!regionIds.length) { setHotelOptions([]); return }
    Promise.all(regionIds.map(getHotelsByRegion))
      .then(results => setHotelOptions(results.flat().map(h => ({ value: h.id, label: h.name }))))
      .catch(err => setError(err.message))
  }, [selectedRegionIds, regionOptions])

  function toggle(setFn) {
    return value => setFn(current => (current.includes(value) ? current.filter(v => v !== value) : [...current, value]))
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setItinerary(null)
    try {
      const destinationName = destinationOptions.find(d => d.value === destinationId)?.label
      const regionNames = regionOptions.filter(r => selectedRegionIds.includes(r.value)).map(r => r.label)
      const hotelNames = hotelOptions.filter(h => selectedHotelIds.includes(h.value)).map(h => h.label)

      const res = await fetch(`${AGENT_API}/api/generate-itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destinationName,
          days: Number(days),
          region_names: regionNames,
          hotel_names: hotelNames,
        }),
      })
      if (!res.ok) throw new Error(`Agent server returned ${res.status}`)
      const data = await res.json()
      setItinerary(data.itinerary)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Could not reach the agent server. In a terminal, run: cd mcp-agent && venv\\Scripts\\python api_server.py'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Agent Playground</h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
        Learning project (mcp-testing branch) — calls the local MCP agent, not part of the live site. Requires
        api_server.py running locally.
      </p>

      <div style={sectionStyle}>
        <label style={labelStyle}>Destination</label>
        <select style={inputStyle} value={destinationId} onChange={e => setDestinationId(e.target.value)}>
          <option value="">Select a destination…</option>
          {destinationOptions.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {destinationId && (
        <div style={sectionStyle}>
          <label style={labelStyle}>Regions (optional — leave blank to include all)</label>
          <ChipPicker options={regionOptions} selected={selectedRegionIds} onToggle={toggle(setSelectedRegionIds)} emptyLabel="No regions found." />
        </div>
      )}

      {destinationId && (
        <div style={sectionStyle}>
          <label style={labelStyle}>Preferred hotel(s) (optional)</label>
          <ChipPicker options={hotelOptions} selected={selectedHotelIds} onToggle={toggle(setSelectedHotelIds)} emptyLabel="No hotels found." />
        </div>
      )}

      <div style={sectionStyle}>
        <label style={labelStyle}>Trip length (days)</label>
        <input
          type="number"
          min="1"
          max="30"
          style={{ ...inputStyle, maxWidth: '120px' }}
          value={days}
          onChange={e => setDays(e.target.value)}
        />
      </div>

      <button type="button" style={primaryButtonStyle} onClick={handleGenerate} disabled={!destinationId || loading}>
        {loading ? 'Generating…' : 'Generate Itinerary'}
      </button>

      {error && <p style={{ fontSize: '13px', color: '#b91c1c', marginTop: '14px' }}>{error}</p>}

      {itinerary && (
        <div style={{ marginTop: '24px', padding: '18px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: '#111827', margin: 0 }}>{itinerary}</pre>
        </div>
      )}
    </div>
  )
}
