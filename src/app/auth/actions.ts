
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers' // For constructing redirect URL

export async function signInWithEmailPassword(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }
  // On successful sign-in, Supabase sets a cookie and the middleware will handle redirection
  // or the client-side router will pick up the auth state change.
  // For explicit redirection after action:
  return redirect('/dashboard')
  // return { success: true }; 
}

export async function signUpWithEmailPassword(email: string, password: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const supabase = createClient()
  const origin = headers().get('origin') // Get origin for email confirmation link

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }
  
  if (data.user && data.user.identities && data.user.identities.length === 0) {
     return { success: false, error: "User already exists. Please try signing in."}
  }

  if (data.session) {
    // User is immediately signed in (e.g. if auto-confirm is on, or this is an existing but unconfirmed user)
     return redirect('/dashboard')
  } else if (data.user) {
    // User needs to confirm their email
    return { success: true, message: "Please check your email to confirm your sign up." }
  }
  
  return { success: false, error: "An unexpected error occurred during sign up." }
}


export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}

