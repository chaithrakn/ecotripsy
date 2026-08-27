import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { getAttractionsByRegion } from '../../lib/supabase/api'
import { getRow, createRow, updateRow } from '../../lib/supabase/adminApi'
import { loadDestinationOptions, loadRegionOptionsForDestination } from '../../lib/admin/entityConfigs'

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }
const primaryButtonStyle = { padding: '10px 18px', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }
const secondaryButtonStyle = { padding: '8px 14px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }

function emptyDay(dayNumber) {
  return { day: dayNumber, title: '', arrival: false, depart: false, suggest_tour: false, free_time_count: 0, attraction_ids: [] }
}

export default function ItineraryTemplateForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [destinationOptions, setDestinationOptions] = useState([])
  const [destinationId, setDestinationId] = useState('')
  const [regionOptions, setRegionOptions] = useState([])
  const [regionId, setRegionId] = useState('')
  const [regionAttractions, setRegionAttractions] = useState([])
  const [days, setDays] = useState([emptyDay(1)])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDestinationOptions()
      .then(setDestinationOptions)
      .catch(err => setError(err.message))
  }, [])

  useEffect(() => {
    loadRegionOptionsForDestination(destinationId)
      .then(setRegionOptions)
      .catch(err => setError(err.message))
  }, [destinationId])

  function handleDestinationChange(value) {
    setDestinationId(value)
    setRegionId('')
  }

  useEffect(() => {
    if (!isEdit) return
    getRow('itinerary_templates', id)
      .then(async row => {
        const { data, error: err } = await supabase.from('regions').select('destination_id').eq('id', row.region_id).single()
        if (err) throw err
        setDestinationId(data.destination_id)
        setRegionId(row.region_id)
        setDays(row.body?.length ? row.body : [emptyDay(1)])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!regionId) { setRegionAttractions([]); return }
    getAttractionsByRegion(regionId)
      .then(setRegionAttractions)
      .catch(err => setError(err.message))
  }, [regionId])

  function updateDay(index, patch) {
    setDays(current => current.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function toggleAttraction(index, attractionId) {
    setDays(current => current.map((d, i) => {
      if (i !== index) return d
      const has = d.attraction_ids.includes(attractionId)
      return { ...d, attraction_ids: has ? d.attraction_ids.filter(a => a !== attractionId) : [...d.attraction_ids, attractionId] }
    }))
  }

  function addDay() {
    setDays(current => [...current, emptyDay(current.length + 1)])
  }

  function removeDay(index) {
    setDays(current => current.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!regionId) { setError('Select a region.'); return }
    setSaving(true)
    setError(null)
    try {
      const body = days.map((d, i) => ({ ...d, day: i + 1, attraction_ids: (d.attraction_ids || []).filter(Boolean) }))
      const payload = { region_id: regionId, days: body.length, body }
      if (isEdit) {
        await updateRow('itinerary_templates', id, payload)
      } else {
        await createRow('itinerary_templates', payload)
      }
      navigate('/admin/itinerary_templates')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</p>

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '680px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        {isEdit ? 'Edit' : 'Add'} Itinerary Template
      </h1>

      <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
          Destination
        </label>
        <select value={destinationId} onChange={e => handleDestinationChange(e.target.value)} required style={inputStyle}>
          <option value="">Select...</option>
          {destinationOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
          Region
        </label>
        <select
          value={regionId}
          onChange={e => setRegionId(e.target.value)}
          required
          disabled={!destinationId}
          style={{ ...inputStyle, ...(!destinationId ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}) }}
        >
          <option value="">{destinationId ? 'Select...' : 'Select a destination first'}</option>
          {regionOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
        Days ({days.length})
      </p>

      {days.map((day, index) => (
        <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F2E1D', margin: 0 }}>Day {index + 1}</p>
            {days.length > 1 && (
              <button type="button" onClick={() => removeDay(index)} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                Remove day
              </button>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Title</label>
            <input value={day.title} onChange={e => updateDay(index, { title: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" checked={day.arrival} onChange={e => updateDay(index, { arrival: e.target.checked })} />
              Arrival day
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" checked={day.depart} onChange={e => updateDay(index, { depart: e.target.checked })} />
              Departure day
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" checked={day.suggest_tour} onChange={e => updateDay(index, { suggest_tour: e.target.checked })} />
              Suggest tours
            </label>
          </div>

          <div style={{ marginBottom: '10px', maxWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Free time (extra attractions)
            </label>
            <input
              type="number"
              min="0"
              value={day.free_time_count}
              onChange={e => updateDay(index, { free_time_count: Number(e.target.value) || 0 })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Attractions {!regionId && '(select a region first)'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {regionAttractions.map(attraction => {
                const selected = day.attraction_ids.includes(attraction.id)
                return (
                  <span
                    key={attraction.id}
                    onClick={() => toggleAttraction(index, attraction.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      border: `1px solid ${selected ? '#0F2E1D' : '#d1d5db'}`,
                      backgroundColor: selected ? '#0F2E1D' : 'white',
                      color: selected ? 'white' : '#374151'
                    }}
                  >
                    {attraction.name}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addDay} style={{ ...secondaryButtonStyle, marginBottom: '24px' }}>
        + Add day
      </button>

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

      <div>
        <button type="submit" disabled={saving} style={{ ...primaryButtonStyle, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
        </button>
      </div>
    </form>
  )
}
