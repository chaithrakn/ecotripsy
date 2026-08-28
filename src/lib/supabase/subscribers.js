import { supabase } from './client'

export async function subscribeEmail(email) {
  const { error } = await supabase.from('subscribers').insert({ email })
  if (error && error.code !== '23505') throw error
  return { alreadySubscribed: error?.code === '23505' }
}
