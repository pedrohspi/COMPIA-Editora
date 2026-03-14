import api from './api'

export const logActivity = async (description) => {
  try {
    const user = JSON.parse(localStorage.getItem('compia_user'))
    const actor = user?.email || 'Sistema'
    await api.post('/logs', {
      description: `${description} (por ${actor})`,
      actor,
      timestamp: new Date().toISOString()
    })
  } catch (e) {
    // silently fail — logs are non-critical
  }
}

export default logActivity
