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
          Land Your Dream Job Faster with an <span className="text-primary">AI-Powered Resume</span>
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10">
          ResumAI crafts compelling, ATS-friendly resumes in minutes. Stop struggling with formatting and wording – let our intelligent platform give you the edge.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <Button size="lg" asChild className="shadow-lg hover:shadow-primary/50 transition-shadow">
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              {isLoggedIn ? 'Go to Dashboard' : 'Create Your Free Resume'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">
              Explore Plans
            </Link>
          </Button>
        </div>
        <div className="relative max-w-4xl mx-auto aspect-[16/9] rounded-xl shadow-2xl overflow-hidden border border-border group">
           <Image 
            src="https://picsum.photos/1280/720" 
            alt="AI Resume Builder creating a professional resume" 
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="resume success"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-left p-4 rounded-b-xl">
            <h3 className="text-xl md:text-2xl font-semibold text-primary-foreground flex items-center">
              <Wand2 className="mr-2 h-6 w-6 text-accent" />
              Intelligent Resume Crafting
            </h3>
            <p className="text-sm md:text-base text-primary-foreground/80 mt-1">
              Our AI understands your career goals to build resumes that truly stand out and impress recruiters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

