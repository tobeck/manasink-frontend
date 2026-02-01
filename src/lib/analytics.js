import { supabase, isSupabaseConfigured } from './supabase'

// Get or create session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('manasink:sessionId')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('manasink:sessionId', sessionId)
  }
  return sessionId
}

/**
 * Track an analytics event
 * @param {string} eventType - Event name (e.g., 'buy_click', 'buy_expand')
 * @param {object} eventData - Additional event data
 */
export async function trackEvent(eventType, eventData = {}) {
  // Always log locally for debugging
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventType, eventData)
  }

  // Skip if Supabase not configured
  if (!isSupabaseConfigured()) return

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      session_id: getSessionId(),
      event_type: eventType,
      event_data: eventData,
      page: window.location.pathname,
    })
  } catch (error) {
    // Silently fail - don't break the app for analytics
    console.error('[Analytics] Failed to track event:', error)
  }
}

/**
 * Track a page view
 * @param {string} page - Page name
 */
export function trackPageView(page) {
  trackEvent('page_view', { page })
}
