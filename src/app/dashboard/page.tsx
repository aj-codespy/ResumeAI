
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeGeneratorForm from '@/components/resume/ResumeGeneratorForm';
import ResumeRevampForm from '@/components/resume/ResumeRevampForm';
import ResumeEditor from '@/components/resume/ResumeEditor';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { 
  GenerateResumeFormData, 
  RevampResumeFormData, 
  GenerateInterviewQuestionsFormData,
  ParsedResumeData,
  InterviewAnswer,
  AtsAnalysisDetails
} from '@/lib/schemas';
import { 
  generateResumeAction, 
  revampResumeAction,
  parseResumeAction,
  generateInterviewQuestionsAction,
  atsOptimizeAction
} from '@/app/actions/resumeActions';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Wand2, FileEdit, Sparkles, HelpCircle, CheckSquare, BotMessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/utils/supabase/client'; // For client-side user fetching


type ResumeResult = {
  content: string; // Markdown
  suggestions?: string[];
  title: string;
  description: string;
  atsMatchScore?: number;
  atsAnalysis?: AtsAnalysisDetails;
  resumeId?: string | null; // ID of the currently loaded/edited resume
} | null;

export default function DashboardPage() {
  const [resumeResult, setResumeResult] = useState<ResumeResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  
  const [isInterviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<InterviewAnswer[]>([]);
  const [interviewContext, setInterviewContext] = useState<any>(null); 

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [currentResumeName, setCurrentResumeName] = useState<string>("New Resume");


  const { toast } = useToast();

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const handleLoadResumeInEditor = (markdownContent: string, resumeId: string, resumeName: string) => {
    setResumeResult(prev => ({
      ...(prev || { title: "", description: "", content: "" }), // Ensure prev is not null
      content: markdownContent,
      title: resumeName,
      description: `Editing saved resume: ${resumeName}`,
      resumeId: resumeId,
      // Preserve other fields like suggestions, atsMatchScore if they exist from a previous operation on this content
    }));
    setCurrentResumeId(resumeId);
    setCurrentResumeName(resumeName);
  };

  const handleInterviewQuestionGeneration = async (contextData: GenerateInterviewQuestionsFormData, nextAction: 'generate' | 'revamp', originalData: any) => {
    setIsLoading(true);
    setLoadingMessage("Generating personalized questions...");
    setInterviewContext({ nextAction, originalData });
    try {
      const result = await generateInterviewQuestionsAction(contextData);
      if (result.success && result.questions) {
        setInterviewQuestions(result.questions);
        setCurrentAnswers(result.questions.map(q => ({ question: q, answer: "" })));
        setInterviewModalOpen(true);
      } else {
        toast({ variant: "destructive", title: "Question Generation Error", description: result.error || "Failed to generate interview questions." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Unexpected Error", description: "An error occurred generating questions." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewSubmit = async () => {
    setInterviewModalOpen(false);
    setIsLoading(true);
    if (interviewContext.nextAction === 'generate') {
      setLoadingMessage("Generating your resume with interview insights...");
      await handleGenerateSubmit({ ...interviewContext.originalData, interviewAnswers: currentAnswers });
    } else if (interviewContext.nextAction === 'revamp') {
      setLoadingMessage("Revamping your resume with interview insights...");
      await handleRevampSubmit({ ...interviewContext.originalData, interviewAnswers: currentAnswers });
    }
    setIsLoading(false);
    setInterviewContext(null);
    setCurrentAnswers([]);
    setInterviewQuestions([]);
  };

  const handleGenerateSubmit = async (data: GenerateResumeFormData, skipInterview?: boolean) => {
    if (!skipInterview && (!data.interviewAnswers || data.interviewAnswers.length === 0)) {
      const interviewContextData: GenerateInterviewQuestionsFormData = {
        targetRole: data.targetJobTitle,
        experienceLevel: data.careerLevel,
        userName: data.name.split(' ')[0], 
      };
      await handleInterviewQuestionGeneration(interviewContextData, 'generate', data);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Crafting your new resume with AI...");
    setResumeResult(null);
    setCurrentResumeId(null); // New resume, so no ID yet
    setCurrentResumeName(data.targetJobTitle ? `Resume for ${data.targetJobTitle}` : "New AI Resume");
    try {
      const result = await generateResumeAction(data);
      if (result.success && result.resumeMarkdown) {
        setResumeResult({
          content: result.resumeMarkdown,
          title: data.targetJobTitle ? `Resume for ${data.targetJobTitle}` : "Your AI-Generated Resume",
          description: "Your new resume has been crafted by AI. Review, refine, and save it below.",
          resumeId: null // Explicitly null for new
        });
        toast({ title: "Resume Generated!", description: "Your AI-powered resume is ready." });
      } else {
        toast({ variant: "destructive", title: "Generation Error", description: result.error || "Failed to generate resume. Please try again." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Unexpected Error", description: "An error occurred during resume generation." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevampSubmit = async (data: RevampResumeFormData, skipInterview?: boolean) => {
     if (!data.resumeDataUri && !data.parsedResumeData) {
      toast({ variant: "destructive", title: "Missing Resume", description: "Please upload a resume file to revamp." });
      return;
    }
    
    let summaryForInterview = "";
    let parsedDataForRevamp = data.parsedResumeData;

    if (data.resumeDataUri && data.fileType && !parsedDataForRevamp) {
        setIsLoading(true);
        setLoadingMessage("Parsing your resume for context...");
        const parseResult = await parseResumeAction({ resumeDataUri: data.resumeDataUri, fileType: data.fileType });
        setIsLoading(false);
        if (parseResult.success && parseResult.parsedData) {
          summaryForInterview = parseResult.parsedData.summary || parseResult.parsedData.rawText?.substring(0, 500) || "";
          parsedDataForRevamp = parseResult.parsedData;
          data.parsedResumeData = parseResult.parsedData; // Ensure data object is updated
        } else {
           toast({ variant: "destructive", title: "Parsing Error", description: "Could not parse resume for interview context. Proceeding without it." });
        }
    } else if (parsedDataForRevamp) {
         summaryForInterview = parsedDataForRevamp.summary || parsedDataForRevamp.rawText?.substring(0,500) || "";
    }
    
    if (!skipInterview && (!data.interviewAnswers || data.interviewAnswers.length === 0)) {
      const interviewContextData: GenerateInterviewQuestionsFormData = {
        targetRole: data.targetJobDescription ? "Role from Job Description" : (parsedDataForRevamp?.experience?.[0]?.role || "General Professional"),
        experienceLevel: parsedDataForRevamp ? (parsedDataForRevamp.experience && parsedDataForRevamp.experience.length > 3 ? 'Mid-Level' : 'Beginner') : undefined,
        existingResumeSummary: summaryForInterview,
      };
      await handleInterviewQuestionGeneration(interviewContextData, 'revamp', data);
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage("Revamping your resume with AI magic...");
    setResumeResult(null);
    setCurrentResumeId(null); // Revamped is like new until saved
    setCurrentResumeName(parsedDataForRevamp?.name ? `Revamped: ${parsedDataForRevamp.name}` : "Revamped Resume");

    try {
      const result = await revampResumeAction(data);
      if (result.success && result.revampedResumeMarkdown) {
        setResumeResult({
          content: result.revampedResumeMarkdown,
          suggestions: result.suggestions,
          title: parsedDataForRevamp?.name ? `Revamped: ${parsedDataForRevamp.name}` : "Your AI-Revamped Resume",
          description: "Your resume has been intelligently revamped. Check out the improvements and suggestions.",
          resumeId: null // Explicitly null for revamped until saved
        });
        toast({ title: "Resume Revamped!", description: "Your resume has been enhanced by AI." });
      } else {
        toast({ variant: "destructive", title: "Revamp Error", description: result.error || "Failed to revamp resume. Please try again." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Unexpected Error", description: "An error occurred during resume revamping." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAtsOptimize = async () => {
    if (!resumeResult?.content) {
      toast({ variant: "destructive", title: "No Resume Content", description: "Please generate or revamp a resume first." });
      return;
    }
    const jobDescription = prompt("Enter the Job Description to optimize against:"); 
    if (!jobDescription) {
      toast({ variant: "info", title: "ATS Optimization Canceled", description: "Job description is required for ATS optimization." });
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Optimizing resume for ATS...");
    try {
      const result = await atsOptimizeAction({ resumeText: resumeResult.content, jobDescription });
      if (result.success && result.optimizedResumeMarkdown) {
        setResumeResult({
          ...resumeResult, // Preserve existing ID if optimizing a saved resume
          content: result.optimizedResumeMarkdown,
          suggestions: result.analysis?.generalSuggestions, 
          title: `ATS Optimized: ${resumeResult.title || "Resume"}`,
          description: `Optimized for the provided job description. ATS Match Score: ${result.atsMatchScore}%`,
          atsMatchScore: result.atsMatchScore,
          atsAnalysis: result.analysis
        });
        toast({ title: "ATS Optimization Complete!", description: `Match Score: ${result.atsMatchScore}%` });
      } else {
        toast({ variant: "destructive", title: "ATS Optimization Error", description: result.error || "Failed to optimize resume." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Unexpected Error", description: "An error occurred during ATS optimization." });
    } finally {
      setIsLoading(false);
    }
  };


  const handleAnswerChange = (index: number, answer: string) => {
    const newAnswers = [...currentAnswers];
    newAnswers[index] = { ...newAnswers[index], answer };
    setCurrentAnswers(newAnswers);
  };

  return (
    <div className="space-y-8 py-8">
      <Card className="text-center p-8 rounded-xl border shadow-md animate-subtle-slide-in-fade">
        <CardHeader className="items-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
            <BotMessageSquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl text-foreground">
            ResumAI: Your Intelligent Career Partner
          </CardTitle>
          <CardDescription className="mt-3 text-md text-foreground/80 max-w-2xl mx-auto">
            Craft a compelling resume from scratch, supercharge an existing one, or optimize for ATS. Let AI guide you to your next opportunity.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="generate" className="w-full animate-subtle-slide-in-fade" style={{ animationDelay: '100ms' }}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 md:w-3/4 lg:w-1/2 mx-auto shadow-sm">
          <TabsTrigger value="generate" className="py-3 text-base">
            <Wand2 className="mr-2 h-5 w-5" /> Create New
          </TabsTrigger>
          <TabsTrigger value="revamp" className="py-3 text-base">
            <FileEdit className="mr-2 h-5 w-5" /> Revamp Existing
          </TabsTrigger>
           <TabsTrigger value="ats" className="py-3 text-base">
            <CheckSquare className="mr-2 h-5 w-5" /> ATS Optimizer
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate" className="mt-6">
          <ResumeGeneratorForm onSubmit={(data) => handleGenerateSubmit(data, false)} isSubmitting={isLoading && loadingMessage.includes("Generating")} />
        </TabsContent>
        <TabsContent value="revamp" className="mt-6">
          <ResumeRevampForm onSubmit={(data) => handleRevampSubmit(data, false)} isSubmitting={isLoading && loadingMessage.includes("Revamping")} />
        </TabsContent>
         <TabsContent value="ats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ATS Optimization</CardTitle>
              <CardDescription>
                Optimize your current resume (generated or revamped above) against a specific job description to improve its chances with Applicant Tracking Systems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                First, generate or revamp a resume using the other tabs. The content in the editor below will be used. Then, click the button and provide the job description.
              </p>
              { !resumeResult?.content && <p className="text-destructive text-sm">Please generate or revamp a resume first using the other tabs.</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={handleAtsOptimize} disabled={isLoading || !resumeResult?.content} className="w-full md:w-auto">
                {isLoading && loadingMessage.includes("Optimizing") ? <LoadingSpinner className="mr-2"/> : null}
                {isLoading && loadingMessage.includes("Optimizing") ? "Optimizing..." : "Optimize Current Resume for ATS"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="flex justify-center items-center mt-8 p-8 bg-card rounded-lg shadow-md animate-subtle-slide-in-fade" style={{ animationDelay: '200ms' }}>
          <LoadingSpinner size={48} />
          <p className="ml-4 text-lg text-primary animate-pulse">
            {loadingMessage}
          </p>
        </div>
      )}

      {resumeResult && (
        <ResumeEditor
          content={resumeResult.content}
          suggestions={resumeResult.suggestions}
          title={resumeResult.title || currentResumeName}
          description={resumeResult.description}
          atsMatchScore={resumeResult.atsMatchScore}
          atsAnalysis={resumeResult.atsAnalysis}
          currentUserId={currentUserId || undefined}
          currentResumeId={resumeResult.resumeId || currentResumeId}
          onLoadResume={handleLoadResumeInEditor}
        />
      )}

      <Dialog open={isInterviewModalOpen} onOpenChange={setInterviewModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center"><HelpCircle className="mr-2 h-6 w-6 text-primary" />Personalization Interview</DialogTitle>
            <DialogDescription>
              Answer these questions to help us tailor your resume even further. Your insights are valuable!
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow pr-6 -mr-6"> 
            <div className="space-y-4 py-4">
              {interviewQuestions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`interview-q-${index}`}>{index + 1}. {question}</Label>
                  <Textarea
                    id={`interview-q-${index}`}
                    value={currentAnswers[index]?.answer || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    rows={3}
                    placeholder="Your answer here..."
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setInterviewModalOpen(false);
              if (interviewContext.nextAction === 'generate') {
                handleGenerateSubmit(interviewContext.originalData, true); 
              } else if (interviewContext.nextAction === 'revamp') {
                handleRevampSubmit(interviewContext.originalData, true); 
              }
            }}>Skip for now</Button>
            <Button onClick={handleInterviewSubmit}>Submit Answers & Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
