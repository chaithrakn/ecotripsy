import {
  getItineraryTemplate,
  getAttractionsByIds,
  getAdditionalAttractions,
  getTourCompaniesByRegion
} from './supabase/api'

function toHotelPlace(hotel) {
  return { id: hotel.id, name: hotel.name, url: hotel.url, image: hotel.image, description: hotel.description, lat: hotel.lat, lng: hotel.lng }
}

function toActivity(attraction) {
  return {
    id: attraction.id,
    name: attraction.name,
    description: attraction.description,
    lat: attraction.lat,
    lng: attraction.lng,
    alternatives: attraction.alternatives || []
  }
}

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
      if (attraction) activities.push(toActivity(attraction))
    }

    const tourSuggestions = day.suggest_tour ? tourCompanies : []

    if (day.free_time_count > 0) {
      const picks = additionalPool.splice(0, day.free_time_count)
      for (const attraction of picks) activities.push(toActivity(attraction))
    }

    return {
      day: day.day,
      title: day.title,
      arrivalNote: day.arrival ? `Check into ${hotel.name} and settle in.` : null,
      activities,
      departNote: day.depart ? 'Depart.' : null,
      tourSuggestions,
      hotel: toHotelPlace(hotel)
    }
  })

  return { days: resultDays }
}

export async function buildTripItinerary({ template, hotels }) {
  const allAttractionIds = template.body.flatMap(day => [
    ...(day.attraction_ids || []),
    ...(day.optional_attraction_ids || [])
  ])
  const attractions = await getAttractionsByIds(allAttractionIds)
  const attractionsById = Object.fromEntries(attractions.map(a => [a.id, a]))

  let currentHotelIndex = 0

  const resultDays = template.body.map(day => {
    let checkinNote = null
    if (day.checkin_hotel) {
      const previousHotel = hotels[currentHotelIndex]
      currentHotelIndex += 1
      const nextHotel = hotels[currentHotelIndex]
      checkinNote = `Check out of ${previousHotel.name}. Check into ${nextHotel.name}.`
    }
    const hotel = hotels[currentHotelIndex]

    const activities = (day.attraction_ids || [])
      .map(id => attractionsById[id])
      .filter(Boolean)
      .map(toActivity)

    const optionalActivities = (day.optional_attraction_ids || [])
      .map(id => attractionsById[id])
      .filter(Boolean)
      .map(toActivity)

    return {
      day: day.day,
      title: day.title,
      arrivalNote: day.arrival ? `Check into ${hotel.name} and settle in.` : null,
      activities,
      optionalActivities,
      note: day.note || null,
      checkinNote,
      departNote: day.depart ? 'Depart.' : null,
      tourSuggestions: [],
      hotel: toHotelPlace(hotel)
    }
  })

  return { days: resultDays }
}
