import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface CallToActionSectionProps {
  isLoggedIn: boolean;
}

export default function CallToActionSection({ isLoggedIn }: CallToActionSectionProps) {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <div 
          className="bg-card border border-border rounded-xl p-8 md:p-12 shadow-xl animate-subtle-slide-in-fade opacity-0"
          style={{ animationDelay: '400ms' }}
        >
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto mb-8">
            Join thousands of successful job seekers who have transformed their careers with ResumAI.
            Start building your future today!
          </p>
          <Button size="lg" asChild>
             <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              {isLoggedIn ? 'Open Dashboard' : 'Create Your AI Resume Now'}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
