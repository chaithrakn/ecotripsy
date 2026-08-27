import { supabase } from './client'

export async function getDestinations() {
  const { data, error } = await supabase.from('destinations').select('*')
  if (error) throw error
  return data
}

export async function getDestinationBySlug(slug) {
  const { data, error } = await supabase.from('destinations').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}

export async function getRegionBySlug(slug) {
  const { data, error } = await supabase.from('regions').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}

export async function getHotelsByRegion(regionId) {
  const { data, error } = await supabase.from('hotels').select('*').eq('region_id', regionId)
  if (error) throw error
  return data
}

export async function getTourCompaniesByRegion(regionId) {
  const { data, error } = await supabase.from('tour_companies').select('*').eq('region_id', regionId)
  if (error) throw error
  return data
}

export async function getItineraryTemplate(regionId, days) {
  const { data, error } = await supabase
    .from('itinerary_templates')
    .select('*')
    .eq('region_id', regionId)
    .eq('days', days)
    .single()
  if (error) throw error
  return data
}

export async function getDefaultDaysForRegion(regionId) {
  const { data, error } = await supabase
    .from('itinerary_templates')
    .select('days')
    .eq('region_id', regionId)
    .order('days', { ascending: true })
    .limit(1)
    .single()
  if (error) throw error
  return data.days
}

export async function getAttractionsByIds(ids) {
  const cleanIds = (ids || []).filter(Boolean)
  if (cleanIds.length === 0) return []
  const { data, error } = await supabase.from('attractions').select('*').in('id', cleanIds)
  if (error) throw error
  return data
}

export async function getAdditionalAttractions(regionId) {
  const { data, error } = await supabase.from('attractions').select('*').eq('region_id', regionId).eq('tier', 'additional')
  if (error) throw error
  return data
}

export async function getAttractionsByRegion(regionId) {
  const { data, error } = await supabase.from('attractions').select('*').eq('region_id', regionId)
  if (error) throw error
  return data
}

export async function getAttractionsByRegions(regionIds) {
  if (!regionIds || regionIds.length === 0) return []
  const { data, error } = await supabase.from('attractions').select('*').in('region_id', regionIds)
  if (error) throw error
  return data
}

export async function getExperiencesByRegions(regionIds) {
  if (!regionIds || regionIds.length === 0) return []
  const { data, error } = await supabase.from('experiences').select('*').in('region_id', regionIds)
  if (error) throw error
  return data
}

export async function getTripTemplatesByDestination(destinationId) {
  const { data, error } = await supabase.from('trip_templates').select('*').eq('destination_id', destinationId)
  if (error) throw error
  return data
}

export async function getLatestContentPages(limit = 6) {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*, destinations(name), regions(name)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getAllContentPages() {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*, destinations(name), regions(name)')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getLatestJournalEntries(limit = 4) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getAllJournalEntries() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getJournalEntryBySlug(slug) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw error
  return data
}

function sortHotels(hotels, sortBy) {
  if (sortBy === 'certified') {
    return [...hotels].sort((a, b) => (b.certified === true) - (a.certified === true))
  }
  if (sortBy === 'name') {
    return [...hotels].sort((a, b) => a.name.localeCompare(b.name))
  }
  return hotels
}

async function getRegionIdsForArticle(article) {
  if (article.region_id) return [article.region_id]
  if (article.destination_id) {
    const { data, error } = await supabase.from('regions').select('id').eq('destination_id', article.destination_id)
    if (error) throw error
    return data.map(r => r.id)
  }
  return []
}

async function resolveHotelListBlock(regionIds, block) {
  const scopedRegionIds = block.region_id ? [block.region_id] : regionIds
  if (scopedRegionIds.length === 0) return { ...block, hotels: [] }

  let query = supabase.from('hotels').select('*, regions(name)').in('region_id', scopedRegionIds)
  if (block.certified !== undefined) query = query.eq('certified', block.certified)
  if (block.pillars?.length > 0) query = query.overlaps('pillars', block.pillars)

  const { data, error } = await query
  if (error) throw error
  return { ...block, hotels: sortHotels(data, block.sort_by) }
}

async function resolveTourListBlock(block) {
  if (!block.region_id) return { ...block, tours: [] }
  const { data, error } = await supabase.from('tour_companies').select('*').eq('region_id', block.region_id)
  if (error) throw error
  return { ...block, tours: data }
}

async function getDestinationWideTourCompanies(destinationId) {
  if (!destinationId) return []
  const { data, error } = await supabase
    .from('tour_companies')
    .select('*')
    .eq('destination_id', destinationId)
    .is('region_id', null)
  if (error) throw error
  return data
}

async function resolveContentBlocks(article) {
  const body = Array.isArray(article.body) ? article.body : []
  const regionIds = await getRegionIdsForArticle(article)

  const [resolvedBody, tourCompanies] = await Promise.all([
    Promise.all(body.map(block => {
      if (block.type === 'hotel_list') return resolveHotelListBlock(regionIds, block)
      if (block.type === 'tour_list') return resolveTourListBlock(block)
      return block
    })),
    getDestinationWideTourCompanies(article.destination_id)
  ])
  return { ...article, body: resolvedBody, tourCompanies }
}

export async function getContentPageBySlug(slug) {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*, destinations(slug), regions(destinations(slug))')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw error
  return resolveContentBlocks(data)
}

export async function getContentPagesByDestination(destinationId) {
  const { data: regions, error: regionsError } = await supabase
    .from('regions')
    .select('id')
    .eq('destination_id', destinationId)
  if (regionsError) throw regionsError

  const orFilters = [`destination_id.eq.${destinationId}`]
  const regionIds = regions.map(r => r.id)
  if (regionIds.length > 0) {
    orFilters.push(`region_id.in.(${regionIds.join(',')})`)
  }

  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .eq('published', true)
    .or(orFilters.join(','))
  if (error) throw error
  return data
}
