import { supabase } from './client'

export async function submitInterest({ firstName, email, role, interests }) {
  const { error } = await supabase.from('interest_submissions').insert({
    first_name: firstName,
    email,
    role,
    interests
  })
  if (error) throw error
}
