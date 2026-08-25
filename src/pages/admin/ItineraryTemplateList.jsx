import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { listRows } from '../../lib/supabase/adminApi'

const primaryButtonStyle = { padding: '10px 18px', backgroundColor: '#0F2E1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }

export default function ItineraryTemplateList() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [regionLabels, setRegionLabels] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      listRows('itinerary_templates'),
      supabase.from('regions').select('id, name, destinations(name)')
    ])
      .then(([templateRows, regionsResult]) => {
        if (regionsResult.error) throw regionsResult.error
        const labels = {}
        for (const r of regionsResult.data) {
          labels[r.id] = `${r.destinations?.name ?? '?'} — ${r.name}`
        }
        setRegionLabels(labels)
        setRows(templateRows)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>Itinerary Templates</h1>
        <button onClick={() => navigate('/admin/itinerary_templates/new')} style={primaryButtonStyle}>
          + Add
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

      {loading ? (
        <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading...</p>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Nothing here yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 8px 12px 0', color: '#111827' }}>
                  {regionLabels[row.region_id] ?? row.region_id}
                </td>
                <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                  {row.days} day{row.days === 1 ? '' : 's'}
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    onClick={() => navigate(`/admin/itinerary_templates/${row.id}`)}
                    style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '999px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
