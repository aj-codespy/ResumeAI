import AuthForm from '@/components/auth/AuthForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LockKeyhole } from 'lucide-react';

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center py-12 animate-subtle-slide-in-fade">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader className="text-center items-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mb-3">
            <LockKeyhole className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to ResumAI</CardTitle>
          <CardDescription>
            Sign in to access your AI career tools and start building your future.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  )
}

