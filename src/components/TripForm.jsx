import { useState, useEffect } from 'react'
import { buildItinerary, buildTripItinerary, buildMultiRegionItinerary, appendExperienceDays } from '../lib/itinerary'
import { getDefaultDaysForRegion, getExperiencesByRegions } from '../lib/supabase/api'

export default function TripForm({ hotels, tripTemplate, onItinerary }) {
  const [selectedHotel, setSelectedHotel] = useState(hotels[0]?.id || '')
  const [selectedLegHotels, setSelectedLegHotels] = useState({})
  const [selectedRegionHotels, setSelectedRegionHotels] = useState({})
  const [selectedRegions, setSelectedRegions] = useState([])
  const [experiences, setExperiences] = useState([])
  const [selectedExperienceIds, setSelectedExperienceIds] = useState([])
  const [baseDays, setBaseDays] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const regionGroups = Object.entries(
    hotels.reduce((groups, hotel) => {
      const key = hotel.region_id || 'unknown'
      groups[key] = groups[key] || []
      groups[key].push(hotel)
      return groups
    }, {})
  )
  const hasMultipleRegions = regionGroups.length > 1
  const availableRegions = regionGroups.map(([key, regionHotels]) => ({
    id: key,
    name: regionHotels[0].regions?.name || key
  }))
  // No explicit region filter means "all regions" — so with multiple regions available,
  // default to letting the traveler pick one hotel per region rather than one hotel total.
  const effectiveRegions = selectedRegions.length > 0 ? selectedRegions : availableRegions.map(r => r.id)
  const combineMode = effectiveRegions.length >= 2
  const effectiveRegionsKey = effectiveRegions.slice().sort().join(',')

  function toggleRegion(regionId) {
    setSelectedRegions(current =>
      current.includes(regionId) ? current.filter(id => id !== regionId) : [...current, regionId]
    )
  }

  const visibleGroups = selectedRegions.length === 0
    ? regionGroups
    : regionGroups.filter(([key]) => selectedRegions.includes(key))
  const showRegionHeadings = visibleGroups.length > 1

  const activeRegionIds = tripTemplate
    ? tripTemplate.legs.map(leg => leg.region_id)
    : combineMode
      ? effectiveRegions
      : (hotels.find(h => h.id === selectedHotel)?.region_id ? [hotels.find(h => h.id === selectedHotel).region_id] : [])
  const activeRegionKey = activeRegionIds.slice().sort().join(',')

  useEffect(() => {
    let cancelled = false
    if (activeRegionIds.length === 0) { setExperiences([]); return }
    getExperiencesByRegions(activeRegionIds)
      .then(data => { if (!cancelled) setExperiences(data) })
      .catch(err => console.error('Failed to load experiences:', err))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegionKey])

  useEffect(() => {
    let cancelled = false
    async function computeBaseDays() {
      if (tripTemplate) {
        setBaseDays(tripTemplate.body.length)
        return
      }
      if (combineMode) {
        const counts = await Promise.all(effectiveRegions.map(getDefaultDaysForRegion))
        if (!cancelled) setBaseDays(counts.reduce((sum, d) => sum + d, 0))
        return
      }
      const hotel = hotels.find(h => h.id === selectedHotel)
      if (!hotel) { setBaseDays(null); return }
      const days = await getDefaultDaysForRegion(hotel.region_id)
      if (!cancelled) setBaseDays(days)
    }
    computeBaseDays().catch(err => console.error('Failed to compute base days:', err))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripTemplate, combineMode, effectiveRegionsKey, selectedHotel])

  function toggleExperience(id) {
    setSelectedExperienceIds(current =>
      current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    )
  }

  const selectedExperiences = experiences.filter(e => selectedExperienceIds.includes(e.id))
  const selectedExtraDays = selectedExperiences.reduce((sum, e) => sum + e.days, 0)
  const maxExtraDays = experiences.reduce((sum, e) => sum + e.days, 0)

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    try {
      let itinerary
      if (tripTemplate) {
        const orderedHotels = tripTemplate.legs.map(leg =>
          hotels.find(h => h.id === selectedLegHotels[leg.region_id])
        )
        if (orderedHotels.some(h => !h)) {
          throw new Error('Select a hotel for every leg')
        }
        itinerary = await buildTripItinerary({ template: tripTemplate, hotels: orderedHotels })
      } else if (combineMode) {
        const selections = []
        for (const regionId of effectiveRegions) {
          const hotel = hotels.find(h => h.id === selectedRegionHotels[regionId])
          if (!hotel) throw new Error('Select a hotel for every region')
          const days = await getDefaultDaysForRegion(regionId)
          const regionName = availableRegions.find(r => r.id === regionId)?.name
          selections.push({ regionId, regionName, hotel, days })
        }
        itinerary = await buildMultiRegionItinerary({ selections })
      } else {
        const hotel = hotels.find(h => h.id === selectedHotel)
        const days = await getDefaultDaysForRegion(hotel.region_id)
        const regionName = hotel.regions?.name
        itinerary = await buildItinerary({ regionId: hotel.region_id, regionName, days, hotel })
      }
      if (selectedExperiences.length > 0) {
        itinerary = await appendExperienceDays(itinerary, selectedExperiences)
      }
      onItinerary(itinerary)
    } catch (err) {
      console.error('Failed to build itinerary:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function ExperiencesSection() {
    if (experiences.length === 0) return null
    return (
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
          Add experiences <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
        </p>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
          {baseDays != null
            ? `Your trip can run ${baseDays}${maxExtraDays > 0 ? `–${baseDays + maxExtraDays}` : ''} days depending on what you add.`
            : 'Pick any add-on experiences for your trip.'}
          {selectedExtraDays > 0 && ` Currently: ${(baseDays ?? 0) + selectedExtraDays} days.`}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {experiences.map(experience => {
            const isSelected = selectedExperienceIds.includes(experience.id)
            return (
              <label
                key={experience.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${isSelected ? '#0F2E1D' : '#e5e7eb'}`,
                  backgroundColor: isSelected ? '#f0faf6' : 'white',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleExperience(experience.id)}
                  style={{ accentColor: '#0F2E1D', marginTop: '3px' }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '15px', color: '#111827' }}>
                    {experience.title}{' '}
                    <span style={{ fontWeight: 400, color: '#6b7280' }}>
                      · {experience.days} day{experience.days === 1 ? '' : 's'}
                    </span>
                  </p>
                  {experience.description && (
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                      {experience.description}
                    </p>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  if (tripTemplate) {
    const canSubmit = tripTemplate.legs.every(leg => selectedLegHotels[leg.region_id])

    return (
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
          {tripTemplate.name}
        </h2>
        <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '28px' }}>
          {tripTemplate.body.length} days · pick a hotel for each leg of the trip.
        </p>

        {tripTemplate.legs.map(leg => (
          <div key={leg.region_id} style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              {leg.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hotels.filter(hotel => hotel.region_id === leg.region_id).map(hotel => (
                <label
                  key={hotel.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${selectedLegHotels[leg.region_id] === hotel.id ? '#0F2E1D' : '#e5e7eb'}`,
                    backgroundColor: selectedLegHotels[leg.region_id] === hotel.id ? '#f0faf6' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name={`hotel-${leg.region_id}`}
                    value={hotel.id}
                    checked={selectedLegHotels[leg.region_id] === hotel.id}
                    onChange={() => setSelectedLegHotels(s => ({ ...s, [leg.region_id]: hotel.id }))}
                    style={{ accentColor: '#0F2E1D' }}
                  />
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '15px', color: '#111827' }}>
                    {hotel.name}
                  </p>
                </label>
              ))}
            </div>
          </div>
        ))}

        <ExperiencesSection />

        <button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading || !canSubmit ? '#9ca3af' : '#0F2E1D',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading || !canSubmit ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate Itinerary →'}
        </button>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '15px', marginTop: '12px' }}>{error}</p>
        )}
      </div>
    )
  }

  const canSubmit = combineMode
    ? effectiveRegions.every(regionId => selectedRegionHotels[regionId])
    : Boolean(selectedHotel)

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
        Plan Your Trip
      </h2>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
        {combineMode
          ? 'Pick a hotel for each region — we\'ll combine them into one trip.'
          : 'Select your stay and we\'ll build a day-by-day itinerary.'}
      </p>

      {/* Region filter (optional) */}
      {hasMultipleRegions && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
            What regions will you travel to? <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional — leave blank to include all)</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {availableRegions.map(region => (
              <button
                key={region.id}
                type="button"
                onClick={() => toggleRegion(region.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${selectedRegions.includes(region.id) ? '#0F2E1D' : '#d1d5db'}`,
                  backgroundColor: selectedRegions.includes(region.id) ? '#0F2E1D' : 'white',
                  color: selectedRegions.includes(region.id) ? 'white' : '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hotel selection */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
          Where will you stay?
        </p>
        {(combineMode
          ? regionGroups.filter(([key]) => effectiveRegions.includes(key))
          : visibleGroups
        ).map(([regionKey, regionHotels]) => (
          <div key={regionKey} style={{ marginBottom: '20px' }}>
            {(combineMode || showRegionHeadings) && (
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#6b7280', marginBottom: '10px' }}>
                {regionHotels[0].regions?.name || regionKey}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {regionHotels.map(hotel => {
                const isSelected = combineMode
                  ? selectedRegionHotels[regionKey] === hotel.id
                  : selectedHotel === hotel.id
                return (
                  <label
                    key={hotel.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${isSelected ? '#0F2E1D' : '#e5e7eb'}`,
                      backgroundColor: isSelected ? '#f0faf6' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name={combineMode ? `hotel-${regionKey}` : 'hotel'}
                      value={hotel.id}
                      checked={isSelected}
                      onChange={() =>
                        combineMode
                          ? setSelectedRegionHotels(s => ({ ...s, [regionKey]: hotel.id }))
                          : setSelectedHotel(hotel.id)
                      }
                      style={{ accentColor: '#0F2E1D' }}
                    />
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '15px', color: '#111827' }}>
                      {hotel.name}
                    </p>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <ExperiencesSection />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !canSubmit}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading || !canSubmit ? '#9ca3af' : '#0F2E1D',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading || !canSubmit ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating...' : 'Generate Itinerary →'}
      </button>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '15px', marginTop: '12px' }}>{error}</p>
      )}
    </div>
  )
}
