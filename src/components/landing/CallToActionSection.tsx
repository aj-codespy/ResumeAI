import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CallToActionSectionProps {
  isLoggedIn: boolean;
}

export default function CallToActionSection({ isLoggedIn }: CallToActionSectionProps) {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <div 
          className="bg-card border border-border rounded-xl p-8 md:p-12 shadow-xl hover:shadow-primary/10 transition-shadow duration-300 animate-subtle-slide-in-fade opacity-0"
          style={{ animationDelay: '400ms' }}
        >
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 tracking-tight">
            Ready to Impress Recruiters and Secure More Interviews?
          </h2>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto mb-10">
            Take control of your job search. ResumAI provides the tools and intelligence you need to create a resume that opens doors. Start your journey to a better career today!
          </p>
          <Button size="lg" asChild className="shadow-md hover:shadow-primary/40 transition-shadow">
             <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              {isLoggedIn ? 'Go to Your Dashboard' : 'Start Building for Free'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

