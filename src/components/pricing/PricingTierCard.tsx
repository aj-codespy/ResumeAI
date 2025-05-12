import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react'; // Added Zap for a generic "benefit" icon

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
      className={`flex flex-col h-full shadow-lg ${popular ? 'border-primary border-2 ring-4 ring-primary/30' : 'border-border'} animate-subtle-slide-in-fade opacity-0 hover:shadow-primary/20 transition-all duration-300 ease-out group`}
      style={{ animationDelay }}
    >
      {popular && (
        <div className="bg-primary text-primary-foreground text-xs font-semibold py-1.5 px-4 rounded-t-md text-center -mb-px relative z-10 tracking-wider">
          MOST POPULAR
        </div>
      )}
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl font-semibold flex items-center gap-2.5">
             <span className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                {icon}
             </span>
             {name}
          </CardTitle>
        </div>
        <div className="flex items-baseline pt-1">
          <span className="text-4xl font-extrabold tracking-tight">{price}</span>
          <span className="ml-1.5 text-lg font-medium text-foreground/70">{frequency}</span>
        </div>
        <CardDescription className="pt-2 text-sm min-h-[40px]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3.5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-left">
              <Check className="h-5 w-5 text-green-500 mr-2.5 shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/90">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-6">
        <Button 
            asChild 
            className="w-full shadow-md hover:shadow-primary/30 transition-shadow" 
            variant={popular ? 'default' : 'outline'}
            size="lg"
        >
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

