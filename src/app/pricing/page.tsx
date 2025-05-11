import PricingTierCard from '@/components/pricing/PricingTierCard';
import { CheckCircle, Sparkles, Briefcase } from 'lucide-react';

const pricingTiers = [
  {
    name: 'Free',
    price: '$0',
    frequency: '/month',
    description: 'Get started with basic AI resume tools.',
    features: [
      '1 AI Resume Generation',
      'Basic Resume Templates',
      'Limited AI Suggestions',
      'Community Support',
    ],
    buttonText: 'Start for Free',
    buttonLink: '/login?plan=free', // Or /dashboard if already implies free tier
    icon: <Sparkles className="h-6 w-6" />,
    popular: false,
    animationDelay: '0ms',
  },
  {
    name: 'Pro',
    price: '$7',
    frequency: '/month',
    description: 'Unlock powerful AI features for job seekers.',
    features: [
      '10 AI Resume Generations/month',
      'All Premium Templates',
      'Advanced AI Revamp & Suggestions',
      'ATS Optimization Tools',
      'Priority Email Support',
    ],
    buttonText: 'Get Started with Pro',
    buttonLink: '/login?plan=pro', // Link to checkout/subscription
    icon: <CheckCircle className="h-6 w-6" />,
    popular: true,
    animationDelay: '100ms',
  },
  {
    name: 'Business',
    price: '$19',
    frequency: '/month',
    description: 'For professionals and frequent users.',
    features: [
      'Unlimited AI Resume Generations',
      'All Premium Templates & Customization',
      'Deep AI Analysis & Feedback',
      'Cover Letter Generation (Coming Soon)',
      'Dedicated Support Manager',
    ],
    buttonText: 'Choose Business',
    buttonLink: '/login?plan=business', // Link to checkout/subscription
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
            Find the Perfect Plan
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Choose the ResumAI plan that best fits your career goals and unlock powerful AI tools.
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
          <p>All plans come with a satisfaction guarantee. Cancel anytime.</p>
          <p>Need a custom solution for your team? <a href="mailto:support@resumai.app" className="text-primary hover:underline">Contact us</a>.</p>
        </div>
      </div>
    </div>
  );
}
