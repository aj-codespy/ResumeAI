import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, FileEdit, ShieldCheck, Brain } from 'lucide-react'; // Changed Zap to Brain for "Summaries"

const features = [
  {
    icon: <Wand2 className="h-8 w-8 text-primary" />,
    title: 'Instant, Tailored Resumes',
    description: 'Generate a complete, professional resume from scratch in minutes. Our AI crafts content that highlights your strengths for your target role.',
    animationDelay: '0ms',
  },
  {
    icon: <FileEdit className="h-8 w-8 text-primary" />,
    title: 'Intelligent Resume Revamp',
    description: 'Breathe new life into your existing resume. Get AI-driven insights to improve clarity, impact, and keyword optimization.',
    animationDelay: '100ms',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Beat the Robots (ATS Optimization)',
    description: 'Navigate Applicant Tracking Systems with ease. Optimize your resume with the right keywords and formatting to pass initial screenings.',
    animationDelay: '200ms',
  },
  {
    icon: <Brain className="h-8 w-8 text-primary" />, // Changed icon
    title: 'Compelling Professional Summaries',
    description: 'Craft an engaging professional summary that grabs attention instantly. Our AI helps you articulate your value proposition concisely.',
    animationDelay: '300ms',
  },
];

export default function FeatureSection() {
  return (
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Unlock Your Resume's Full Potential
          </h2>
          <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
            ResumAI is more than a builder; it's your personal career assistant, packed with intelligent tools to get you noticed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="text-center shadow-lg hover:shadow-primary/20 transition-shadow duration-300 animate-subtle-slide-in-fade opacity-0"
              style={{ animationDelay: feature.animationDelay }}
            >
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

