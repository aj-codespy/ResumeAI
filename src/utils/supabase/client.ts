import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error('CLIENT: Missing or invalid NEXT_PUBLIC_SUPABASE_URL environment variable. It must start with http:// or https:// and be available client-side.')
  }
  if (!supabaseAnonKey) {
    throw new Error('CLIENT: Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. It must be available client-side.')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
