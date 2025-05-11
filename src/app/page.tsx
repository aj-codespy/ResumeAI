import HeroSection from '@/components/landing/HeroSection';
import FeatureSection from '@/components/landing/FeatureSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import { createClient } from '@/utils/supabase/server';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      <HeroSection isLoggedIn={!!user} />
      <FeatureSection />
      {/* Placeholder for other sections like Testimonials if needed */}
      <CallToActionSection isLoggedIn={!!user}/>
    </div>
  );
}
