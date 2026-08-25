import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRow, createRow, updateRow } from '../../lib/supabase/adminApi'

const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }
const primaryButtonStyle = { padding: '10px 18px', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }

function initialValues(config) {
  const values = {}
  for (const field of config.fields) {
    if (field.type === 'multiselect') values[field.name] = field.default ?? []
    else if (field.type === 'boolean') values[field.name] = field.default ?? false
    else values[field.name] = field.default ?? ''
  }
  return values
}

export default function AdminEntityForm({ config }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [values, setValues] = useState(() => initialValues(config))
  const [optionsByField, setOptionsByField] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    config.fields.forEach(field => {
      if (field.loadOptions) {
        field.loadOptions()
          .then(opts => setOptionsByField(prev => ({ ...prev, [field.name]: opts })))
          .catch(err => setError(err.message))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    if (!isEdit) return
    getRow(config.table, id)
      .then(row => setValues(v => ({ ...v, ...row })))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function setField(name, value) {
    setValues(v => ({ ...v, [name]: value }))
  }

  function toggleMulti(name, option) {
    setValues(v => {
      const current = v[name] || []
      const next = current.includes(option) ? current.filter(o => o !== option) : [...current, option]
      return { ...v, [name]: next }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {}
      for (const field of config.fields) {
        let val = values[field.name]
        if (field.type === 'number') val = val === '' || val === null ? null : Number(val)
        payload[field.name] = val
      }
      if (isEdit) {
        await updateRow(config.table, id, payload)
      } else {
        await createRow(config.table, payload)
      }
      navigate(`/admin/${config.table}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</p>

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '520px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        {isEdit ? 'Edit' : 'Add'} {config.label.replace(/s$/, '')}
      </h1>

      {config.fields.map(field => (
        <div key={field.name} style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
            {field.label || field.name}
          </label>

          {field.type === 'text' && (
            <input
              value={values[field.name] || ''}
              onChange={e => setField(field.name, e.target.value)}
              required={field.required}
              style={inputStyle}
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              value={values[field.name] || ''}
              onChange={e => setField(field.name, e.target.value)}
              rows={4}
              style={inputStyle}
            />
          )}

          {field.type === 'number' && (
            <input
              type="number"
              step={field.step || '1'}
              value={values[field.name] ?? ''}
              onChange={e => setField(field.name, e.target.value)}
              style={inputStyle}
            />
          )}

          {field.type === 'boolean' && (
            <input
              type="checkbox"
              checked={Boolean(values[field.name])}
              onChange={e => setField(field.name, e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
          )}

          {field.type === 'select' && (
            <select
              value={values[field.name] || ''}
              onChange={e => setField(field.name, e.target.value)}
              required={field.required}
              style={inputStyle}
            >
              <option value="">Select...</option>
              {(field.options || optionsByField[field.name] || []).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {field.type === 'multiselect' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {field.options.map(opt => {
                const selected = (values[field.name] || []).includes(opt)
                return (
                  <span
                    key={opt}
                    onClick={() => toggleMulti(field.name, opt)}
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
                    {opt}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

      <button type="submit" disabled={saving} style={{ ...primaryButtonStyle, opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create'}
      </button>
    </form>
  )
}
