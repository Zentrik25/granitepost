// Re-export for convenience — always import from the specific file in server
// contexts to preserve the 'server-only' guard.
export { createClient as createBrowserSupabaseClient } from './client'
