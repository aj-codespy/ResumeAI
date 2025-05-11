'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Chrome } from 'lucide-react' // Using Chrome icon as a generic browser/Google icon

export default function AuthForm() {
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleGoogleSignIn} className="w-full" variant="outline">
        <Chrome className="mr-2 h-5 w-5" />
        Sign in with Google
      </Button>
      {/* Placeholder for email/password or other providers if needed later */}
      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <form className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form> */}
    </div>
  )
}
