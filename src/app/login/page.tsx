import AuthForm from '@/components/auth/AuthForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login to ResumAI</CardTitle>
          <CardDescription>
            Access your AI-powered resume tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  )
}
