
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Chrome, Mail, KeyRound } from 'lucide-react' // Added Mail and KeyRound icons
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { signInWithEmailPassword, signUpWithEmailPassword } from '@/app/auth/actions'

export default function AuthForm() {
  const supabase = createClient()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleGoogleSignIn = async () => {
    setAuthMessage(null)
    setIsSubmitting(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    // No need to set isSubmitting to false here as the page will redirect
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthMessage(null)
    setIsSubmitting(true)
    const result = await signInWithEmailPassword(email, password)
    if (result.error) {
      setAuthMessage({ type: 'error', text: result.error })
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: result.error,
      })
    } else if (result.success) {
      // Redirect is handled by the server action if successful
      toast({
        title: 'Signed In!',
        description: 'You are now signed in.',
      })
      // No explicit redirect here, server action handles it.
    }
    setIsSubmitting(false)
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthMessage(null)
    setIsSubmitting(true)
    const result = await signUpWithEmailPassword(email, password)
    if (result.error) {
      setAuthMessage({ type: 'error', text: result.error })
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: result.error,
      })
    } else if (result.success && result.message) {
      setAuthMessage({ type: 'success', text: result.message })
      toast({
        title: 'Sign Up Successful!',
        description: result.message,
      })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <Button onClick={handleGoogleSignIn} className="w-full" variant="outline" disabled={isSubmitting}>
        <Chrome className="mr-2 h-5 w-5" />
        Sign in with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {authMessage && (
        <div className={`p-3 rounded-md text-sm ${
          authMessage.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-700'
        }`}>
          {authMessage.text}
        </div>
      )}

      <form className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
           <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleEmailSignIn} type="submit" className="w-full flex-1" disabled={isSubmitting || !email || !password}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
          <Button onClick={handleEmailSignUp} type="button" variant="secondary" className="w-full flex-1" disabled={isSubmitting || !email || !password}>
             {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </div>
      </form>
    </div>
  )
}
