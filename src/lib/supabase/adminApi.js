import { supabase } from './client'

export async function listRows(table) {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRow(table, id) {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createRow(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateRow(table, id, values) {
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}
