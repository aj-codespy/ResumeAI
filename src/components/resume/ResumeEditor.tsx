
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardCopy, Check, Info, ThumbsUp, AlertTriangle, Lightbulb, Percent, BarChart3, FileDown, Save, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AtsAnalysisDetails, ResumeSchema, ParsedResumeData } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { exportResumeAsPdf, exportResumeAsDocx, saveResume, listUserResumes, getResumeDetails, deleteResume } from '@/app/actions/resumeActions';
import LoadingSpinner from '../LoadingSpinner';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { Trash2 } from 'lucide-react';

interface ResumeEditorProps {
  content: string;
  suggestions?: string[];
  title?: string;
  description?: string;
  atsMatchScore?: number;
  atsAnalysis?: AtsAnalysisDetails;
  currentUserId?: string; // For saving/loading resumes
  currentResumeId?: string | null; // For knowing if we are editing an existing resume
  onLoadResume: (markdownContent: string, resumeId: string, resumeName: string) => void; // Callback to update dashboard state
}

export default function ResumeEditor({ 
  content, 
  suggestions,
  title = "Your Resume",
  description = "Review and edit your AI-generated or revamped resume content below.",
  atsMatchScore,
  atsAnalysis,
  currentUserId,
  currentResumeId,
  onLoadResume,
}: ResumeEditorProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState<false | 'pdf' | 'docx'>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [savedResumes, setSavedResumes] = useState<ResumeSchema[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [resumeNameToSave, setResumeNameToSave] = useState(title);
  const [currentLoadedResumeId, setCurrentLoadedResumeId] = useState<string | null>(currentResumeId || null);
  const [currentLoadedResumeName, setCurrentLoadedResumeName] = useState<string>(title);


  const { toast } = useToast();

  useEffect(() => {
    setEditedContent(content);
    // If a new resume is generated (no currentResumeId), reset name for save dialog
    if (!currentResumeId) {
        setResumeNameToSave(title); // Default to the generated title
        setCurrentLoadedResumeId(null);
    }
  }, [content, currentResumeId, title]);

   useEffect(() => {
    if (currentUserId) {
      fetchUserResumes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);
  
  useEffect(() => {
    setCurrentLoadedResumeName(title);
  }, [title]);


  const fetchUserResumes = async () => {
    if (!currentUserId) return;
    setIsLoadingResumes(true);
    try {
      const result = await listUserResumes();
      if (result.success && result.resumes) {
        setSavedResumes(result.resumes);
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || "Failed to load saved resumes." });
      }
    } catch (e) {
       toast({ variant: "destructive", title: "Error", description: "Could not fetch resumes." });
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handleLoadResume = async (resume: ResumeSchema) => {
    onLoadResume(resume.markdown_content, resume.id, resume.resume_name);
    setCurrentLoadedResumeId(resume.id);
    setCurrentLoadedResumeName(resume.resume_name);
    setResumeNameToSave(resume.resume_name); // Pre-fill save dialog with loaded resume name
    toast({ title: "Resume Loaded", description: `"${resume.resume_name}" has been loaded into the editor.` });
  };
  
  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) return;
    try {
      const result = await deleteResume(resumeId);
      if (result.success) {
        toast({ title: "Resume Deleted", description: "The resume has been successfully deleted." });
        fetchUserResumes(); // Refresh the list
        if (currentLoadedResumeId === resumeId) { // If current loaded resume is deleted
          onLoadResume("", "", "New Resume"); // Reset editor
          setCurrentLoadedResumeId(null);
        }
      } else {
        toast({ variant: "destructive", title: "Deletion Failed", description: result.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete resume." });
    }
  };


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

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!editedContent) {
      toast({ variant: "destructive", title: "No Content", description: "There is no resume content to export." });
      return;
    }
    setIsExporting(format);
    try {
      const result = format === 'pdf'
        ? await exportResumeAsPdf(editedContent)
        : await exportResumeAsDocx(editedContent);

      if (result.success && result.fileBuffer && result.fileName && result.contentType) {
        const byteCharacters = atob(result.fileBuffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: result.contentType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export Successful", description: `Your resume has been downloaded as ${result.fileName}.` });
      } else {
        toast({ variant: "destructive", title: "Export Failed", description: result.error || `Failed to export resume as ${format.toUpperCase()}.` });
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      toast({ variant: "destructive", title: "Export Error", description: `An unexpected error occurred while exporting as ${format.toUpperCase()}.` });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveResume = async () => {
    if (!currentUserId) {
      toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to save resumes." });
      return;
    }
    if (!editedContent) {
      toast({ variant: "destructive", title: "No Content", description: "There is no resume content to save." });
      return;
    }
    setIsSaving(true);
    try {
      // Try to find ATS score from analysis if available
      let scoreToSave: number | undefined = undefined;
      if (atsAnalysis && atsMatchScore !== undefined) {
        scoreToSave = atsMatchScore;
      }

      const result = await saveResume({
        id: currentLoadedResumeId || undefined,
        user_id: currentUserId,
        resume_name: resumeNameToSave,
        markdown_content: editedContent,
        // TODO: Potentially save parsed JSON data and ATS analysis details if needed
        // json_data: currentParsedData, // This would need to be passed down or derived
        ats_score: scoreToSave 
      });

      if (result.success && result.resumeId) {
        toast({ title: "Resume Saved!", description: `"${resumeNameToSave}" has been saved.` });
        setCurrentLoadedResumeId(result.resumeId); // Update current loaded ID
        setCurrentLoadedResumeName(resumeNameToSave); // Update current loaded name
        setShowSaveDialog(false);
        fetchUserResumes(); // Refresh list of saved resumes
      } else {
        toast({ variant: "destructive", title: "Save Failed", description: result.error || "Failed to save resume." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Save Error", description: "An unexpected error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };
  
  const openSaveDialog = () => {
    if (!currentLoadedResumeId) { // If it's a new, unsaved resume
        setResumeNameToSave(title === "Your AI-Generated Resume" || title === "Your AI-Revamped Resume" || title === "ATS Optimized Resume" ? "My New Resume" : title);
    } else { // If it's an existing resume, prefill with its current name
        setResumeNameToSave(currentLoadedResumeName);
    }
    setShowSaveDialog(true);
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
        <CardTitle className="text-2xl">{currentLoadedResumeName || title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentUserId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><List className="mr-2 h-5 w-5"/>My Saved Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingResumes ? <LoadingSpinner /> : (
                savedResumes.length > 0 ? (
                  <ScrollArea className="h-40">
                    <ul className="space-y-2">
                      {savedResumes.map(resume => (
                        <li key={resume.id} className="flex justify-between items-center p-2 border rounded-md hover:bg-accent">
                          <span className="truncate cursor-pointer" onClick={() => handleLoadResume(resume)}>
                            {resume.resume_name} (ATS: {resume.ats_score ?? 'N/A'}%)
                          </span>
                           <Button variant="ghost" size="sm" onClick={() => handleDeleteResume(resume.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No saved resumes found.</p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline" onClick={fetchUserResumes} disabled={isLoadingResumes}>Refresh List</Button>
            </CardFooter>
          </Card>
        )}

        {atsMatchScore !== undefined && atsAnalysis && renderAtsAnalysis()}

        {suggestions && suggestions.length > 0 && !atsAnalysis && ( 
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
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <Button onClick={handleCopy} disabled={!editedContent || isExporting !== false || isSaving} className="min-w-[120px]">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          {currentUserId && (
            <Button onClick={openSaveDialog} disabled={!editedContent || isExporting !== false || isSaving} className="min-w-[120px]">
              {isSaving ? <LoadingSpinner size={16} className="mr-2"/> : <Save className="mr-2 h-4 w-4" />}
              {currentLoadedResumeId ? 'Save Changes' : 'Save Resume'}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('pdf')} disabled={!editedContent || isExporting !== false || isSaving} variant="outline" className="min-w-[140px]">
            {isExporting === 'pdf' ? <LoadingSpinner size={16} className="mr-2"/> : <FileDown className="mr-2 h-4 w-4" />}
            Download PDF
          </Button>
          <Button onClick={() => handleExport('docx')} disabled={!editedContent || isExporting !== false || isSaving} variant="outline" className="min-w-[150px]">
            {isExporting === 'docx' ? <LoadingSpinner size={16} className="mr-2"/> : <FileDown className="mr-2 h-4 w-4" />}
            Download DOCX
          </Button>
        </div>
      </CardFooter>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentLoadedResumeId ? "Save Changes to" : "Save New Resume As"}</DialogTitle>
            <DialogDescription>
              {currentLoadedResumeId ? `Enter a new name for "${currentLoadedResumeName}" or keep the current name.` : "Enter a name for your new resume."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={resumeNameToSave}
              onChange={(e) => setResumeNameToSave(e.target.value)}
              placeholder="Resume Name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveResume} disabled={isSaving || !resumeNameToSave.trim()}>
              {isSaving ? <LoadingSpinner size={16} className="mr-2"/> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
