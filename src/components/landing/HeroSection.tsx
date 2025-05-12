import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wand2 } from 'lucide-react';
import Image from 'next/image';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="py-12 md:py-20 animate-subtle-slide-in-fade">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
          Craft Your Perfect Resume with <span className="text-primary">AI Power</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10">
          ResumAI helps you generate professional resumes, revamp existing ones, and optimize them for success in minutes. Stop struggling, start impressing.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <Button size="lg" asChild>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">
              View Pricing
            </Link>
          </Button>
        </div>
        <div className="relative max-w-4xl mx-auto aspect-[16/9] rounded-xl shadow-2xl overflow-hidden border border-border">
           <Image 
            src="https://picsum.photos/1280/720" 
            alt="AI Resume Builder Interface" 
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 hover:scale-105"
            data-ai-hint="resume builder"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-left">
            <h3 className="text-xl md:text-2xl font-semibold text-primary-foreground flex items-center">
              <Wand2 className="mr-2 h-5 w-5 text-accent" />
              Intelligent Resume Crafting
            </h3>
            <p className="text-sm md:text-base text-primary-foreground/80 mt-1">
              Our AI understands your career goals to build resumes that stand out.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
