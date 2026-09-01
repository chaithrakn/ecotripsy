import { saveHotel, saveTourCompany, saveGuide, saveItinerary } from './supabase/saved'

const KEY = 'greenlugg_pending_save'

export function setPendingSave(action) {
  try {
    localStorage.setItem(KEY, JSON.stringify(action))
  } catch (err) {
    console.error('Failed to store pending save:', err)
  }
}

export function takePendingSave() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    localStorage.removeItem(KEY)
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read pending save:', err)
    return null
  }
}

export async function executePendingSave(userId, action) {
  switch (action.type) {
    case 'hotel':
      return saveHotel(userId, action.id)
    case 'tourCompany':
      return saveTourCompany(userId, action.id)
    case 'guide':
      return saveGuide(userId, action.id)
    case 'itinerary':
      return saveItinerary(userId, { contentPageId: action.contentPageId, title: action.title, body: action.body })
    default:
      return
  }
}
