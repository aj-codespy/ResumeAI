import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, FileEdit, ShieldCheck, Zap } from 'lucide-react';

const features = [
  {
    icon: <Wand2 className="h-8 w-8 text-primary" />,
    title: 'AI Resume Generation',
    description: 'Create tailored resumes from scratch in minutes. Just provide your details and let our AI do the heavy lifting.',
    animationDelay: '0ms',
  },
  {
    icon: <FileEdit className="h-8 w-8 text-primary" />,
    title: 'Smart Resume Revamping',
    description: 'Upload your existing resume and get AI-powered suggestions to enhance its impact and clarity.',
    animationDelay: '100ms',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'ATS Optimization',
    description: 'Ensure your resume gets past Applicant Tracking Systems with keyword optimization and formatting checks.',
    animationDelay: '200ms',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Instant Professional Summary',
    description: 'Generate compelling professional summaries that capture recruiter attention immediately.',
    animationDelay: '300ms',
  },
];

export default function FeatureSection() {
  return (
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Everything You Need for Resume Success
          </h2>
          <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
            Leverage cutting-edge AI tools designed to make your job application process smoother and more effective.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="text-center shadow-lg animate-subtle-slide-in-fade opacity-0"
              style={{ animationDelay: feature.animationDelay }}
            >
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
