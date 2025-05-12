import PricingTierCard from '@/components/pricing/PricingTierCard';
import { CheckCircle, Sparkles, Briefcase, Award } from 'lucide-react'; // Added Award icon

const pricingTiers = [
  {
    name: 'Starter',
    price: '$0',
    frequency: '/always free',
    description: 'Kickstart your journey with essential AI resume tools.',
    features: [
      '1 AI-Generated Resume Draft',
      'Access to Basic Resume Templates',
      'Key AI-Powered Writing Suggestions',
      'Community Support Access',
    ],
    buttonText: 'Start for Free',
    buttonLink: '/login?plan=starter', 
    icon: <Sparkles className="h-6 w-6" />,
    popular: false,
    animationDelay: '0ms',
  },
  {
    name: 'Pro',
    price: '$7',
    frequency: '/month',
    description: 'The job seeker’s choice for a competitive edge and more interviews.',
    features: [
      'Up to 10 AI Resume Generations/month',
      'Full Access to All Premium Templates',
      'Advanced AI Revamp & In-depth Suggestions',
      'Comprehensive ATS Optimization Tools',
      'Priority Email Support',
    ],
    buttonText: 'Go Pro & Get Hired',
    buttonLink: '/login?plan=pro', 
    icon: <Award className="h-6 w-6" />, // Changed Icon
    popular: true,
    animationDelay: '100ms',
  },
  {
    name: 'Executive',
    price: '$19',
    frequency: '/month',
    description: 'For serious professionals demanding the best tools and unlimited access.',
    features: [
      'Unlimited AI Resume Generations',
      'Unlimited Access to All Templates & Customizations',
      'Deep-Dive AI Analysis & Personalized Feedback',
      'AI Cover Letter Generation (Beta)',
      'Dedicated Support Manager',
    ],
    buttonText: 'Choose Executive',
    buttonLink: '/login?plan=executive', 
    icon: <Briefcase className="h-6 w-6" />,
    popular: false,
    animationDelay: '200ms',
  },
];

export default function PricingPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16 animate-subtle-slide-in-fade">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Find Your Edge: ResumAI Pricing Plans
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Choose the perfect plan to supercharge your job applications. Start free, or unlock advanced AI power to land your dream job faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {pricingTiers.map((tier) => (
            <PricingTierCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              frequency={tier.frequency}
              description={tier.description}
              features={tier.features}
              buttonText={tier.buttonText}
              buttonLink={tier.buttonLink}
              icon={tier.icon}
              popular={tier.popular}
              animationDelay={tier.animationDelay}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center text-sm text-foreground/60 animate-subtle-slide-in-fade" style={{animationDelay: '300ms'}}>
          <p>All paid plans come with a 7-day money-back guarantee. Cancel anytime.</p>
          <p>Need a custom solution for your team or educational institution? <a href="mailto:sales@resumai.app" className="text-primary hover:underline">Contact Sales</a>.</p>
        </div>
      </div>
    </div>
  );
}

