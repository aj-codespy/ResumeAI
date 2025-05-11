import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PricingTierCardProps {
  name: string;
  price: string;
  frequency: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  icon: React.ReactNode;
  popular?: boolean;
  animationDelay?: string;
}

export default function PricingTierCard({
  name,
  price,
  frequency,
  description,
  features,
  buttonText,
  buttonLink,
  icon,
  popular = false,
  animationDelay = '0ms',
}: PricingTierCardProps) {
  return (
    <Card 
      className={`flex flex-col h-full shadow-lg ${popular ? 'border-primary border-2 ring-2 ring-primary/50' : 'border-border'} animate-subtle-slide-in-fade opacity-0`}
      style={{ animationDelay }}
    >
      {popular && (
        <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-t-md text-center -mb-px relative z-10">
          MOST POPULAR
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            {icon} {name}
          </CardTitle>
        </div>
        <div className="flex items-baseline">
          <span className="text-4xl font-extrabold tracking-tight">{price}</span>
          <span className="ml-1 text-xl font-medium text-foreground/70">{frequency}</span>
        </div>
        <CardDescription className="pt-2 text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
            asChild 
            className="w-full" 
            variant={popular ? 'default' : 'outline'}
            size="lg"
        >
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
