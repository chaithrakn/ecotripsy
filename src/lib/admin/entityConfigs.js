import { supabase } from '../supabase/client'
import { PILLARS } from '../pillars'

const INTERESTS = ['culture', 'wellness', 'farming', 'adventure', 'wildlife', 'explore']

async function loadDestinationOptions() {
  const { data, error } = await supabase.from('destinations').select('id, name').order('name')
  if (error) throw error
  return data.map(d => ({ value: d.id, label: d.name }))
}

async function loadRegionOptions() {
  const { data, error } = await supabase
    .from('regions')
    .select('id, name, destinations(name)')
    .order('name')
  if (error) throw error
  return data.map(r => ({ value: r.id, label: `${r.destinations?.name ?? '?'} — ${r.name}` }))
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
    { name: 'region_id', type: 'select', label: 'Region', loadOptions: loadRegionOptions, required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'url', type: 'text', label: 'Website URL' },
    { name: 'image', type: 'text', label: 'Image path/URL' },
    {
      name: 'price_range',
      type: 'select',
      options: [
        { value: 'budget', label: 'Budget' },
        { value: 'mid', label: 'Mid' },
        { value: 'luxury', label: 'Luxury' }
      ]
    },
    { name: 'price_min', type: 'number', label: 'Price min' },
    { name: 'price_max', type: 'number', label: 'Price max' },
    { name: 'pillars', type: 'multiselect', options: PILLARS.map(p => p.key) },
    { name: 'interests', type: 'multiselect', options: INTERESTS },
    { name: 'lat', type: 'number', step: 'any' },
    { name: 'lng', type: 'number', step: 'any' },
    { name: 'certified', type: 'boolean' },
    { name: 'certification', type: 'text' }
  ]
}

export const ENTITIES = [DESTINATION_CONFIG, REGION_CONFIG, HOTEL_CONFIG]
