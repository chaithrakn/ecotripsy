import { supabase } from './client'

export async function getSavedHotelIds(userId) {
  const { data, error } = await supabase.from('saved_hotels').select('hotel_id').eq('user_id', userId)
  if (error) throw error
  return data.map(row => row.hotel_id)
}

export async function saveHotel(userId, hotelId) {
  const { error } = await supabase.from('saved_hotels').insert({ user_id: userId, hotel_id: hotelId })
  if (error) throw error
}

export async function unsaveHotel(userId, hotelId) {
  const { error } = await supabase.from('saved_hotels').delete().eq('user_id', userId).eq('hotel_id', hotelId)
  if (error) throw error
}

export async function getSavedTourCompanyIds(userId) {
  const { data, error } = await supabase.from('saved_tour_companies').select('tour_company_id').eq('user_id', userId)
  if (error) throw error
  return data.map(row => row.tour_company_id)
}

export async function saveTourCompany(userId, tourCompanyId) {
  const { error } = await supabase.from('saved_tour_companies').insert({ user_id: userId, tour_company_id: tourCompanyId })
  if (error) throw error
}

export async function unsaveTourCompany(userId, tourCompanyId) {
  const { error } = await supabase.from('saved_tour_companies').delete().eq('user_id', userId).eq('tour_company_id', tourCompanyId)
  if (error) throw error
}

export async function getSavedGuideIds(userId) {
  const { data, error } = await supabase.from('saved_guides').select('content_page_id').eq('user_id', userId)
  if (error) throw error
  return data.map(row => row.content_page_id)
}

export async function saveGuide(userId, contentPageId) {
  const { error } = await supabase.from('saved_guides').insert({ user_id: userId, content_page_id: contentPageId })
  if (error) throw error
}

export async function unsaveGuide(userId, contentPageId) {
  const { error } = await supabase.from('saved_guides').delete().eq('user_id', userId).eq('content_page_id', contentPageId)
  if (error) throw error
}

export async function saveItinerary(userId, { contentPageId, title, body }) {
  const { error } = await supabase.from('saved_itineraries').insert({
    user_id: userId,
    content_page_id: contentPageId,
    title,
    body
  })
  if (error) throw error
}

export async function getSavedItineraries(userId) {
  const { data, error } = await supabase
    .from('saved_itineraries')
    .select('*, content_pages(slug, cover_image)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function deleteSavedItinerary(userId, id) {
  const { error } = await supabase.from('saved_itineraries').delete().eq('user_id', userId).eq('id', id)
  if (error) throw error
}

export async function getSavedItineraryById(userId, id) {
  const { data, error } = await supabase
    .from('saved_itineraries')
    .select('*, content_pages(slug, title, cover_image)')
    .eq('user_id', userId)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getSavedHotelsFull(userId) {
  const { data, error } = await supabase
    .from('saved_hotels')
    .select('hotel_id, hotels(*, regions(name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(row => row.hotels).filter(Boolean)
}

export async function getSavedTourCompaniesFull(userId) {
  const { data, error } = await supabase
    .from('saved_tour_companies')
    .select('tour_company_id, tour_companies(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(row => row.tour_companies).filter(Boolean)
}

export async function getSavedGuidesFull(userId) {
  const { data, error } = await supabase
    .from('saved_guides')
    .select('content_page_id, content_pages(*, destinations(name), regions(name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(row => row.content_pages).filter(Boolean)
}
