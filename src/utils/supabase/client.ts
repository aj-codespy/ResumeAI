import { createBrowserClient } from '@supabase/ssr'

// A simple mock Supabase client to prevent crashes when env vars are missing.
// Operations will fail gracefully, but the app won't crash on initialization.
const createMockSupabaseClient = () => {
  const client = {
    auth: {
      getUser: async () => {
        // console.warn("Mock Supabase (Client): getUser called, Supabase not configured.");
        return { data: { user: null }, error: new Error("Supabase client is not configured due to missing environment variables.") };
      },
      signInWithOAuth: async (options: any) => {
        console.error("Mock Supabase (Client): signInWithOAuth called, Supabase not configured. OAuth flow will not work.");
        return { data: { provider: options.provider, url: '#' } as any, error: new Error("Supabase client is not configured for OAuth.") };
      },
      signOut: async () => {
        // console.warn("Mock Supabase (Client): signOut called, Supabase not configured.");
        return { error: new Error("Supabase client is not configured.") };
      },
       exchangeCodeForSession: async (code: string) => {
        // console.warn("Mock Supabase (Client): exchangeCodeForSession called, Supabase not configured.");
        return { data: { session: null, user: null } as any, error: new Error("Supabase client is not configured.") };
      },
      // Add other auth methods used by your app if necessary
    },
    from: (table: string) => {
      // console.warn(`Mock Supabase (Client): from(${table}) called, Supabase not configured.`);
      const queryBuilder: any = {
        select: (columns?: string) => queryBuilder, // Chainable
        insert: async (data: any) => ({ data: [], error: new Error("Supabase client is not configured.") }),
        update: async (data: any) => ({ data: [], error: new Error("Supabase client is not configured.") }),
        delete: async () => ({ data: [], error: new Error("Supabase client is not configured.") }),
        eq: (column: string, value: any) => queryBuilder,
        order: (column: string, options?: any) => queryBuilder,
        limit: (count: number) => queryBuilder,
        single: async () => ({ data: null, error: new Error("Supabase client is not configured.") }),
        // Add other query builder methods as needed
      };
      // Ensure actual async methods return promises
      queryBuilder.select = async (columns?: string) => ({ data: [], error: new Error("Supabase client is not configured.") });
      return queryBuilder;
    },
  };
  return client as any; 
};


export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseUrl.startsWith('http') || !supabaseAnonKey) {
    console.error('CLIENT: Critical Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or invalid. Supabase functionality will be disabled. Please set them in your .env file or environment configuration.');
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
        console.error('Specifically, NEXT_PUBLIC_SUPABASE_URL is missing or invalid for browser client.');
    }
    if (!supabaseAnonKey) {
        console.error('Specifically, NEXT_PUBLIC_SUPABASE_ANON_KEY is missing for browser client.');
    }
    return createMockSupabaseClient();
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
