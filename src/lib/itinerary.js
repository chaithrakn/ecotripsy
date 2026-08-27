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

export async function buildItinerary({ regionId, regionName, days, hotel }) {
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
      regionId,
      regionName: regionName || null,
      hotel: toHotelPlace(hotel)
    }
  })

  return { days: resultDays }
}

export async function appendExperienceDays(itinerary, experiences) {
  const days = [...itinerary.days]
  let dayNumber = days.length > 0 ? days[days.length - 1].day + 1 : 1

  const tourRegionIds = [...new Set(experiences.filter(e => e.suggest_tour).map(e => e.region_id))]
  const tourCompanyLists = await Promise.all(tourRegionIds.map(getTourCompaniesByRegion))
  const tourCompaniesByRegion = Object.fromEntries(tourRegionIds.map((id, i) => [id, tourCompanyLists[i]]))

  for (const experience of experiences) {
    const dayStart = dayNumber
    const dayEnd = dayNumber + experience.days - 1
    days.push({
      day: dayStart,
      dayEnd: experience.days > 1 ? dayEnd : undefined,
      title: null,
      arrivalNote: null,
      activities: [],
      departNote: null,
      tourSuggestions: experience.suggest_tour ? (tourCompaniesByRegion[experience.region_id] || []) : [],
      note: experience.description || null,
      regionId: null,
      regionName: experience.title,
      hotel: null
    })
    dayNumber = dayEnd + 1
  }

  return { days }
}

export async function buildMultiRegionItinerary({ selections }) {
  const allDays = []
  let dayOffset = 0

  for (const { regionId, regionName, days, hotel } of selections) {
    const leg = await buildItinerary({ regionId, regionName, days, hotel })
    for (const day of leg.days) {
      allDays.push({ ...day, day: day.day + dayOffset })
    }
    dayOffset += leg.days.length
  }

  return { days: allDays }
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
      regionId: template.legs[currentHotelIndex]?.region_id || null,
      regionName: template.legs[currentHotelIndex]?.label || null,
      hotel: toHotelPlace(hotel)
    }
  })

  return { days: resultDays }
}
