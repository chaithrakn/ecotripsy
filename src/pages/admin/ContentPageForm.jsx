import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRow, createRow, updateRow } from '../../lib/supabase/adminApi'
import { loadDestinationOptions, loadRegionOptionsForDestination } from '../../lib/admin/entityConfigs'
import { PILLARS } from '../../lib/pillars'

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }
const primaryButtonStyle = { padding: '10px 18px', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }
const secondaryButtonStyle = { padding: '8px 14px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
const smallButtonStyle = { fontSize: '12px', padding: '2px 8px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }
const fieldLabelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }

function newBlockId() {
  return Math.random().toString(36).slice(2)
}

function emptyBlock(type) {
  if (type === 'text') return { _id: newBlockId(), type: 'text', content: '' }
  if (type === 'hotel_list') return { _id: newBlockId(), type: 'hotel_list', region_id: '', certified: '', pillars: [], sort_by: '' }
  return { _id: newBlockId(), type: 'tour_list', region_id: '', title: '' }
}

function blockLabel(type) {
  if (type === 'text') return 'Text'
  if (type === 'hotel_list') return 'Hotel list'
  return 'Tour list'
}

export default function ContentPageForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [destinationOptions, setDestinationOptions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])

  const [destinationId, setDestinationId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [intro, setIntro] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [published, setPublished] = useState(false)
  const [tripDays, setTripDays] = useState('')
  const [pillars, setPillars] = useState([])
  const [cardRegions, setCardRegions] = useState('')
  const [blocks, setBlocks] = useState([])
  const [newBlockType, setNewBlockType] = useState('text')

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
    getRow('content_pages', id)
      .then(row => {
        setDestinationId(row.destination_id || '')
        setRegionId(row.region_id || '')
        setTitle(row.title || '')
        setSlug(row.slug || '')
        setExcerpt(row.excerpt || '')
        setIntro(row.intro || '')
        setCoverImage(row.cover_image || '')
        setPublished(Boolean(row.published))
        setTripDays(row.trip_days ?? '')
        setPillars(row.pillars || [])
        setCardRegions(row.card_regions || '')
        setBlocks((row.body || []).map(b => ({ ...emptyBlock(b.type), ...b, _id: newBlockId() })))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  function togglePillar(pillar) {
    setPillars(current => current.includes(pillar) ? current.filter(p => p !== pillar) : [...current, pillar])
  }

  function updateBlock(index, patch) {
    setBlocks(current => current.map((b, i) => (i === index ? { ...b, ...patch } : b)))
  }

  function toggleBlockPillar(index, pillar) {
    setBlocks(current => current.map((b, i) => {
      if (i !== index) return b
      const has = (b.pillars || []).includes(pillar)
      return { ...b, pillars: has ? b.pillars.filter(p => p !== pillar) : [...(b.pillars || []), pillar] }
    }))
  }

  function addBlock() {
    setBlocks(current => [...current, emptyBlock(newBlockType)])
  }

  function removeBlock(index) {
    setBlocks(current => current.filter((_, i) => i !== index))
  }

  function moveBlock(index, direction) {
    setBlocks(current => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = blocks.map(({ _id, ...block }) => {
        if (block.type === 'text') {
          return { type: 'text', content: block.content }
        }
        if (block.type === 'hotel_list') {
          const cleaned = { type: 'hotel_list' }
          if (block.region_id) cleaned.region_id = block.region_id
          if (block.certified === 'true' || block.certified === 'false') cleaned.certified = block.certified === 'true'
          if (block.pillars?.length > 0) cleaned.pillars = block.pillars
          if (block.sort_by) cleaned.sort_by = block.sort_by
          return cleaned
        }
        const cleaned = { type: 'tour_list' }
        if (block.region_id) cleaned.region_id = block.region_id
        if (block.title) cleaned.title = block.title
        return cleaned
      })

      const payload = {
        destination_id: destinationId || null,
        region_id: regionId || null,
        title,
        slug,
        excerpt,
        intro,
        cover_image: coverImage,
        published,
        trip_days: tripDays === '' ? null : Number(tripDays),
        pillars,
        card_regions: cardRegions || null,
        body
      }

      if (isEdit) {
        await updateRow('content_pages', id, payload)
      } else {
        await createRow('content_pages', payload)
      }
      navigate('/admin/content_pages')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</p>

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        {isEdit ? 'Edit' : 'Add'} Article
      </h1>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Destination</label>
        <select value={destinationId} onChange={e => handleDestinationChange(e.target.value)} required style={inputStyle}>
          <option value="">Select...</option>
          {destinationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Region (optional — leave blank for a destination-wide article)</label>
        <select
          value={regionId}
          onChange={e => setRegionId(e.target.value)}
          disabled={!destinationId}
          style={{ ...inputStyle, ...(!destinationId ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}) }}
        >
          <option value="">{destinationId ? 'None' : 'Select a destination first'}</option>
          {regionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Slug</label>
        <input value={slug} onChange={e => setSlug(e.target.value)} required style={inputStyle} />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Excerpt</label>
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Intro (markdown)</label>
        <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={4} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Cover image URL</label>
        <input value={coverImage} onChange={e => setCoverImage(e.target.value)} style={inputStyle} />
      </div>

      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '24px 0 12px' }}>
        Trip card (shown on the homepage and "Plan a trip" grid)
      </p>

      <div style={{ marginBottom: '18px', maxWidth: '160px' }}>
        <label style={fieldLabelStyle}>Trip days</label>
        <input
          type="number"
          min="1"
          value={tripDays}
          onChange={e => setTripDays(e.target.value)}
          placeholder="e.g. 10"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={fieldLabelStyle}>Regions shown on card (free text — keep it short, e.g. "Lisbon · Algarve · Douro · Porto", or abbreviate to "Lisbon · Algarve +2" if there are too many to fit)</label>
        <input value={cardRegions} onChange={e => setCardRegions(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={fieldLabelStyle}>Pillars shown on card</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PILLARS.map(p => {
            const selected = pillars.includes(p.key)
            return (
              <span
                key={p.key}
                onClick={() => togglePillar(p.key)}
                style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer',
                  border: `1px solid ${selected ? '#0F2E1D' : '#d1d5db'}`,
                  backgroundColor: selected ? '#0F2E1D' : 'white',
                  color: selected ? 'white' : '#374151'
                }}
              >
                {p.key}
              </span>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
          Published
        </label>
      </div>

      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
        Body blocks ({blocks.length})
      </p>

      {blocks.map((block, index) => (
        <div key={block._id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F2E1D', margin: 0 }}>{blockLabel(block.type)}</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} style={{ ...smallButtonStyle, opacity: index === 0 ? 0.4 : 1 }}>↑</button>
              <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} style={{ ...smallButtonStyle, opacity: index === blocks.length - 1 ? 0.4 : 1 }}>↓</button>
              <button type="button" onClick={() => removeBlock(index)} style={{ ...smallButtonStyle, color: '#ef4444' }}>Remove</button>
            </div>
          </div>

          {block.type === 'text' && (
            <div>
              <label style={fieldLabelStyle}>Content (markdown)</label>
              <textarea value={block.content} onChange={e => updateBlock(index, { content: e.target.value })} rows={5} style={inputStyle} />
            </div>
          )}

          {block.type === 'hotel_list' && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <label style={fieldLabelStyle}>Region (optional — omit to use all regions in this article)</label>
                <select value={block.region_id} onChange={e => updateBlock(index, { region_id: e.target.value })} style={inputStyle}>
                  <option value="">All article regions</option>
                  {regionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={fieldLabelStyle}>Certified</label>
                  <select value={block.certified} onChange={e => updateBlock(index, { certified: e.target.value })} style={inputStyle}>
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={fieldLabelStyle}>Sort by</label>
                  <select value={block.sort_by} onChange={e => updateBlock(index, { sort_by: e.target.value })} style={inputStyle}>
                    <option value="">Default</option>
                    <option value="certified">Certified first</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Pillars filter (optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {PILLARS.map(p => {
                    const selected = (block.pillars || []).includes(p.key)
                    return (
                      <span
                        key={p.key}
                        onClick={() => toggleBlockPillar(index, p.key)}
                        style={{
                          padding: '4px 10px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer',
                          border: `1px solid ${selected ? '#0F2E1D' : '#d1d5db'}`,
                          backgroundColor: selected ? '#0F2E1D' : 'white',
                          color: selected ? 'white' : '#374151'
                        }}
                      >
                        {p.key}
                      </span>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {block.type === 'tour_list' && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <label style={fieldLabelStyle}>Region</label>
                <select value={block.region_id} onChange={e => updateBlock(index, { region_id: e.target.value })} style={inputStyle}>
                  <option value="">Select...</option>
                  {regionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabelStyle}>Section title (optional)</label>
                <input value={block.title} onChange={e => updateBlock(index, { title: e.target.value })} placeholder="Suggested Tours" style={inputStyle} />
              </div>
            </>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '24px' }}>
        <select value={newBlockType} onChange={e => setNewBlockType(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="text">Text</option>
          <option value="hotel_list">Hotel list</option>
          <option value="tour_list">Tour list</option>
        </select>
        <button type="button" onClick={addBlock} style={secondaryButtonStyle}>+ Add block</button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

      <div>
        <button type="submit" disabled={saving} style={{ ...primaryButtonStyle, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
        </button>
      </div>
    </form>
  )
}
