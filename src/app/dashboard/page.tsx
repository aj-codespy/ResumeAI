"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeGeneratorForm from '@/components/resume/ResumeGeneratorForm';
import ResumeRevampForm from '@/components/resume/ResumeRevampForm';
import ResumeEditor from '@/components/resume/ResumeEditor';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { GenerateResumeFormData, RevampResumeFormData } from '@/lib/schemas';
import { generateResumeAction, revampResumeAction } from '@/app/actions/resumeActions';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, FileEdit, Sparkles } from 'lucide-react';

type ResumeResult = {
  content: string;
  suggestions?: string[];
  title: string;
  description: string;
} | null;

export default function DashboardPage() {
  const [resumeResult, setResumeResult] = useState<ResumeResult>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevamping, setIsRevamping] = useState(false);
  const { toast } = useToast();

  const handleGenerateSubmit = async (data: GenerateResumeFormData) => {
    setIsGenerating(true);
    setResumeResult(null);
    try {
      const result = await generateResumeAction(data);
      if (result.success && result.resume) {
        setResumeResult({
          content: result.resume,
          title: "Your AI-Generated Resume",
          description: "Your new resume has been crafted by AI. Review and refine it below."
        });
        toast({ title: "Resume Generated!", description: "Your AI-powered resume is ready." });
      } else {
        toast({ variant: "destructive", title: "Generation Error", description: result.error || "Failed to generate resume. Please try again." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Unexpected Error", description: "An error occurred during resume generation." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevampSubmit = async (data: RevampResumeFormData) => {
    setIsRevamping(true);
    setResumeResult(null);
    try {
      const result = await revampResumeAction(data);
      if (result.success && result.revampedResume) {
        setResumeResult({
          content: result.revampedResume,
          suggestions: result.suggestions,
          title: "Your AI-Revamped Resume",
          description: "Your resume has been intelligently revamped. Check out the improvements and suggestions."
        });
        toast({ title: "Resume Revamped!", description: "Your resume has been enhanced by AI." });
      } else {
        toast({ variant: "destructive", title: "Revamp Error", description: result.error || "Failed to revamp resume. Please try again." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Unexpected Error", description: "An error occurred during resume revamping." });
    } finally {
      setIsRevamping(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <Card className="text-center p-8 rounded-xl border shadow-md animate-subtle-slide-in-fade">
        <CardHeader className="items-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl text-foreground">
            Your ResumAI Command Center
          </CardTitle>
          <CardDescription className="mt-3 text-md text-foreground/80 max-w-2xl mx-auto">
            Ready to build a standout resume? Generate a new one from scratch or let AI supercharge your existing draft.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="w-full animate-subtle-slide-in-fade" style={{ animationDelay: '100ms' }}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 md:w-1/2 mx-auto shadow-sm">
          <TabsTrigger value="generate" className="py-3 text-base">
            <Wand2 className="mr-2 h-5 w-5" /> Create New Resume
          </TabsTrigger>
          <TabsTrigger value="revamp" className="py-3 text-base">
            <FileEdit className="mr-2 h-5 w-5" /> Enhance Existing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-6">
          <ResumeGeneratorForm onSubmit={handleGenerateSubmit} isSubmitting={isGenerating} />
        </TabsContent>
        <TabsContent value="revamp" className="mt-6">
          <ResumeRevampForm onSubmit={handleRevampSubmit} isSubmitting={isRevamping} />
        </TabsContent>
      </Tabs>

      {(isGenerating || isRevamping) && (
        <div className="flex justify-center items-center mt-8 p-8 bg-card rounded-lg shadow-md animate-subtle-slide-in-fade" style={{ animationDelay: '200ms' }}>
          <LoadingSpinner size={48} />
          <p className="ml-4 text-lg text-primary animate-pulse">
            {isGenerating ? "Crafting your resume with AI, please wait..." : "Revamping your resume with AI magic..."}
          </p>
        </div>
      )}

      {resumeResult && (
        <ResumeEditor
          content={resumeResult.content}
          suggestions={resumeResult.suggestions}
          title={resumeResult.title}
          description={resumeResult.description}
        />
      )}
    </div>
  );
}

