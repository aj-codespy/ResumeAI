import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// A simple mock Supabase client for middleware context.
const createMockSupabaseClientForMiddleware = (request: NextRequest, response: NextResponse) => {
  const client = {
    auth: {
      getUser: async () => {
        // console.warn("Mock Supabase (Middleware): getUser called, Supabase not configured.");
        return { data: { user: null }, error: new Error("Supabase (Middleware) not configured due to missing environment variables.") };
      },
      // Middleware typically only needs getUser, but other methods can be added if required.
    },
    // No 'from' or other data methods typically needed in basic middleware auth context.
  };
  return client as any; // Use 'as any' for simplicity.
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let supabase;

  if (!supabaseUrl || !supabaseUrl.startsWith('http') || !supabaseAnonKey) {
    console.error('MIDDLEWARE: Critical Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or invalid. Supabase session updates will be attempted with a mock client, likely resulting in no user session.');
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
        console.error('Specifically, NEXT_PUBLIC_SUPABASE_URL is missing or invalid for middleware client.');
    }
    if (!supabaseAnonKey) {
        console.error('Specifically, NEXT_PUBLIC_SUPABASE_ANON_KEY is missing for middleware client.');
    }
    supabase = createMockSupabaseClientForMiddleware(request, response);
  } else {
    supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            // Ensure response object is updated if cookies are set
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
             // Ensure response object is updated if cookies are removed
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
  }

  // This will call getUser on either the real or mock client.
  // The mock client's getUser will return { data: { user: null }, error: ... }
  await supabase.auth.getUser()

  return response
}
