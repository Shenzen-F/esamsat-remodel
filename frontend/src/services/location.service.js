import { API_BASE_URL } from '../constants/env'

export const getSamsatLocations = async () => {
  try {
    const response = await fetch(API_BASE_URL + '/sb/info_lokasi')
    if (!response.ok) throw new Error('HTTP ' + response.status)
    return await response.json() 
  } catch (err) {
    console.error('[getSamsatLocations]', err)
    return { success: false, message: 'Gagal menghubungi server.', data: [] }
  }
}
