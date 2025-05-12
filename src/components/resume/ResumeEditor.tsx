
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardCopy, Check, Info, ThumbsUp, AlertTriangle, Lightbulb, Percent, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AtsAnalysisDetails } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ResumeEditorProps {
  content: string;
  suggestions?: string[];
  title?: string;
  description?: string;
  atsMatchScore?: number;
  atsAnalysis?: AtsAnalysisDetails;
}

export default function ResumeEditor({ 
  content, 
  suggestions,
  title = "Your Resume",
  description = "Review and edit your AI-generated or revamped resume content below.",
  atsMatchScore,
  atsAnalysis
}: ResumeEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent).then(() => {
      setCopied(true);
      toast({ title: "Copied!", description: "Resume content copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      toast({ variant: "destructive", title: "Copy failed", description: "Could not copy content." });
      console.error('Failed to copy: ', err);
    });
  };

  const renderAtsAnalysis = () => {
    if (!atsAnalysis) return null;

    return (
      <Card className="mt-4 border-primary/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />ATS Optimization Analysis</CardTitle>
          {atsMatchScore !== undefined && (
             <div className="mt-2">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-primary">ATS Match Score</span>
                    <span className="text-sm font-bold text-primary">{atsMatchScore}%</span>
                </div>
                <Progress value={atsMatchScore} className="w-full h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                    This score estimates compatibility with Applicant Tracking Systems based on keywords and structure.
                </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {atsAnalysis.strengths && atsAnalysis.strengths.length > 0 && (
              <AccordionItem value="strengths">
                <AccordionTrigger className="text-base"><ThumbsUp className="mr-2 h-5 w-5 text-green-500" />Strengths</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {atsAnalysis.strengths.map((s, i) => <li key={`strength-${i}`}>{s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            {atsAnalysis.keywordAnalysis && (
              <AccordionItem value="keywords">
                <AccordionTrigger className="text-base"><Info className="mr-2 h-5 w-5 text-blue-500" />Keyword Analysis</AccordionTrigger>
                <AccordionContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Keywords Found:</h4>
                    {atsAnalysis.keywordAnalysis.foundKeywords && atsAnalysis.keywordAnalysis.foundKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {atsAnalysis.keywordAnalysis.foundKeywords.map((kw, i) => <Badge key={`found-kw-${i}`} variant="secondary">{kw}</Badge>)}
                      </div>
                    ) : <p className="text-muted-foreground">No specific keywords from the job description were prominently found.</p>}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Missing Keywords:</h4>
                    {atsAnalysis.keywordAnalysis.missingKeywords && atsAnalysis.keywordAnalysis.missingKeywords.length > 0 ? (
                       <div className="flex flex-wrap gap-2">
                        {atsAnalysis.keywordAnalysis.missingKeywords.map((kw, i) => <Badge key={`missing-kw-${i}`} variant="outline" className="border-destructive text-destructive">{kw}</Badge>)}
                      </div>
                    ) : <p className="text-muted-foreground">Looks good! No critical missing keywords identified.</p>}
                  </div>
                  {atsAnalysis.keywordAnalysis.densityScore !== undefined && (
                    <p>Keyword Density Score (conceptual): <Badge variant="default">{Math.round(atsAnalysis.keywordAnalysis.densityScore * 100)}%</Badge></p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
             {atsAnalysis.formattingSuggestions && atsAnalysis.formattingSuggestions.length > 0 && (
              <AccordionItem value="formatting">
                <AccordionTrigger className="text-base"><Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />Formatting & Structure</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {atsAnalysis.formattingSuggestions.map((s, i) => <li key={`format-sugg-${i}`}>{s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            {atsAnalysis.toneAndTenseCheck && atsAnalysis.toneAndTenseCheck.length > 0 && (
              <AccordionItem value="tone">
                <AccordionTrigger className="text-base"><AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />Tone & Tense</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {atsAnalysis.toneAndTenseCheck.map((s, i) => <li key={`tone-sugg-${i}`}>{s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
            {atsAnalysis.generalSuggestions && atsAnalysis.generalSuggestions.length > 0 && (
              <AccordionItem value="general">
                <AccordionTrigger className="text-base"><Lightbulb className="mr-2 h-5 w-5 text-purple-500" />General Suggestions</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {atsAnalysis.generalSuggestions.map((s, i) => <li key={`gen-sugg-${i}`}>{s}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="mt-8 shadow-lg animate-subtle-slide-in-fade" style={{animationDelay: '300ms'}}>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display ATS Score and Analysis if available BEFORE suggestions */}
        {atsMatchScore !== undefined && atsAnalysis && renderAtsAnalysis()}

        {suggestions && suggestions.length > 0 && !atsAnalysis && ( // Only show general suggestions if no ATS analysis
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">AI Suggestions</CardTitle>
              <CardDescription>Consider these points to improve your resume further:</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index} 
                      className="animate-subtle-slide-in-fade opacity-0"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        <div>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={25}
            className="text-sm leading-relaxed p-4 rounded-md shadow-inner bg-secondary/30 focus-within:shadow-md"
            placeholder="Your resume content will appear here..."
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopy} disabled={!editedContent} className="w-full md:w-auto">
          {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy Resume Text'}
        </Button>
      </CardFooter>
    </Card>
  );
}
