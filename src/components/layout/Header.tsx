import Link from 'next/link';
import { Briefcase, LogIn } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import UserNav from '@/components/auth/UserNav';
import { Button } from '@/components/ui/button';

export default async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary transition-opacity duration-150 ease-out hover:opacity-75 active:opacity-60"
        >
          <Briefcase className="h-8 w-8" />
          <span>ResumAI</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          {user ? (
            <UserNav user={user} />
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
