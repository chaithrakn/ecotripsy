import { supabase } from '../supabase/client'
import { PILLARS } from '../pillars'

const INTERESTS = ['culture', 'wellness', 'farming', 'adventure', 'wildlife', 'explore']

export async function loadDestinationOptions() {
  const { data, error } = await supabase.from('destinations').select('id, name').order('name')
  if (error) throw error
  return data.map(d => ({ value: d.id, label: d.name }))
}

export async function loadRegionOptionsForDestination(destinationId) {
  if (!destinationId) return []
  const { data, error } = await supabase
    .from('regions')
    .select('id, name')
    .eq('destination_id', destinationId)
    .order('name')
  if (error) throw error
  return data.map(r => ({ value: r.id, label: r.name }))
}

async function getDestinationIdForRegion(regionId) {
  if (!regionId) return ''
  const { data, error } = await supabase.from('regions').select('destination_id').eq('id', regionId).single()
  if (error) throw error
  return data.destination_id
}

export const DESTINATION_CONFIG = {
  table: 'destinations',
  label: 'Destinations',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'tagline', type: 'text' },
    { name: 'image', type: 'text', label: 'Image URL' },
    { name: 'overview', type: 'textarea' },
    { name: 'ideal_days', type: 'number', label: 'Ideal days' },
    { name: 'available', type: 'boolean', default: true }
  ]
}

export const REGION_CONFIG = {
  table: 'regions',
  label: 'Regions',
  fields: [
    { name: 'destination_id', type: 'select', label: 'Destination', loadOptions: loadDestinationOptions, required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'description', type: 'textarea' }
  ]
}

export const HOTEL_CONFIG = {
  table: 'hotels',
  label: 'Hotels',
  fields: [
    { name: '_destination_id', type: 'select', label: 'Destination', loadOptions: loadDestinationOptions, virtual: true, required: true },
    { name: 'region_id', type: 'select', label: 'Region', loadOptions: loadRegionOptionsForDestination, dependsOn: '_destination_id', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'url', type: 'text', label: 'Website URL' },
    { name: 'image', type: 'text', label: 'Image path/URL' },
    { name: 'price_min', type: 'number', label: 'Price min' },
    { name: 'price_max', type: 'number', label: 'Price max' },
    { name: 'pillars', type: 'multiselect', options: PILLARS.map(p => p.key) },
    { name: 'interests', type: 'multiselect', options: INTERESTS },
    { name: 'lat', type: 'decimal' },
    { name: 'lng', type: 'decimal' },
    { name: 'certified', type: 'boolean' },
    { name: 'certification', type: 'text' }
  ],
  hydrateVirtual: async row => ({ _destination_id: await getDestinationIdForRegion(row.region_id) })
}

export const TOUR_COMPANY_CONFIG = {
  table: 'tour_companies',
  label: 'Tour Companies',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'url', type: 'text', label: 'Website URL' },
    { name: 'image', type: 'text', label: 'Image path/URL' },
    { name: 'destination_id', type: 'select', label: 'Destination', loadOptions: loadDestinationOptions, required: true },
    { name: 'region_id', type: 'select', label: 'Region (optional — leave blank for a destination-wide company)', loadOptions: loadRegionOptionsForDestination, dependsOn: 'destination_id' },
    { name: 'pillars', type: 'multiselect', options: PILLARS.map(p => p.key) },
    { name: 'interests', type: 'multiselect', options: INTERESTS },
    { name: 'lat', type: 'decimal' },
    { name: 'lng', type: 'decimal' }
  ]
}

export const EXPERIENCE_CONFIG = {
  table: 'experiences',
  label: 'Experiences',
  fields: [
    { name: '_destination_id', type: 'select', label: 'Destination', loadOptions: loadDestinationOptions, virtual: true, required: true },
    { name: 'region_id', type: 'select', label: 'Region', loadOptions: loadRegionOptionsForDestination, dependsOn: '_destination_id', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'days', type: 'number', label: 'Days', required: true },
    { name: 'suggest_tour', type: 'boolean', label: 'Suggest tour companies for this region', default: false }
  ],
  hydrateVirtual: async row => ({ _destination_id: await getDestinationIdForRegion(row.region_id) })
}

export const JOURNAL_CONFIG = {
  table: 'journal_entries',
  label: 'Field Notes',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'cover_image', type: 'text', label: 'Cover image URL' },
    { name: 'body', type: 'textarea', label: 'Body (markdown — use ![alt](image url) to place images)', rows: 12 },
    { name: 'published', type: 'boolean', default: false }
  ]
}

export const ENTITIES = [DESTINATION_CONFIG, REGION_CONFIG, HOTEL_CONFIG, TOUR_COMPANY_CONFIG, EXPERIENCE_CONFIG, JOURNAL_CONFIG]
