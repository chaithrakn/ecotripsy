import {
  getItineraryTemplate,
  getAttractionsByIds,
  getAdditionalAttractions,
  getTourCompaniesByRegion
} from './supabase/api'

export async function buildItinerary({ regionId, days, hotel }) {
  const template = await getItineraryTemplate(regionId, days)
  const mustVisitIds = template.body.flatMap(day => day.attraction_ids || [])
  const usedIds = new Set(mustVisitIds)

  const needsTour = template.body.some(day => day.suggest_tour)
  const needsAdditional = template.body.some(day => day.free_time_count > 0)

  const [mustVisitAttractions, tourCompanies, additionalAttractions] = await Promise.all([
    getAttractionsByIds(mustVisitIds),
    needsTour ? getTourCompaniesByRegion(regionId) : Promise.resolve([]),
    needsAdditional ? getAdditionalAttractions(regionId) : Promise.resolve([])
  ])

  const attractionsById = Object.fromEntries(mustVisitAttractions.map(a => [a.id, a]))
  const additionalPool = additionalAttractions.filter(a => !usedIds.has(a.id))

  const resultDays = template.body.map(day => {
    const activities = []

    for (const id of day.attraction_ids || []) {
      const attraction = attractionsById[id]
      if (attraction) activities.push({ id: attraction.id, name: attraction.name, description: attraction.description, lat: attraction.lat, lng: attraction.lng, alternatives: attraction.alternatives || [] })
    }

    const tourSuggestions = day.suggest_tour ? tourCompanies : []

    if (day.free_time_count > 0) {
      const picks = additionalPool.splice(0, day.free_time_count)
      for (const attraction of picks) activities.push({ id: attraction.id, name: attraction.name, description: attraction.description, lat: attraction.lat, lng: attraction.lng, alternatives: attraction.alternatives || [] })
    }

    return {
      day: day.day,
      title: day.title,
      arrivalNote: day.arrival ? `Check into ${hotel.name} and settle in.` : null,
      activities,
      departNote: day.depart ? 'Depart.' : null,
      tourSuggestions,
      hotel: { id: hotel.id, name: hotel.name, url: hotel.url, image: hotel.image, description: hotel.description, lat: hotel.lat, lng: hotel.lng }
    }
  })

  return { days: resultDays }
}
