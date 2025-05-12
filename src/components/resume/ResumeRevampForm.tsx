
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { RevampResumeFormData, InterviewAnswer, ParsedResumeData } from "@/lib/schemas";
import { RevampResumeFormSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";

interface ResumeRevampFormProps {
  onSubmit: (data: RevampResumeFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function ResumeRevampForm({ onSubmit, isSubmitting }: ResumeRevampFormProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  
  const form = useForm<RevampResumeFormData>({
    resolver: zodResolver(RevampResumeFormSchema),
    defaultValues: {
      resumeDataUri: undefined,
      fileType: undefined,
      parsedResumeData: undefined, // This will be populated after parsing by the action
      targetJobDescription: "",
      interviewAnswers: [], // Will be populated after interview step
    },
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        form.setValue("resumeDataUri", dataUri);
        
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') {
          form.setValue('fileType', 'pdf');
        } else if (extension === 'docx') {
          form.setValue('fileType', 'docx');
        } else if (extension === 'txt') {
          form.setValue('fileType', 'txt');
        } else {
          form.setError('resumeFile', { type: 'manual', message: 'Unsupported file type. Please use PDF, DOCX, or TXT.' });
          setFileName(null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(null);
      form.setValue("resumeDataUri", undefined);
      form.setValue("fileType", undefined);
    }
  };
  
  const handleSubmitWithInterviewData = (data: RevampResumeFormData) => {
    const dataToSubmit = {
      ...data,
      interviewAnswers: form.getValues("interviewAnswers") // Ensure latest interview answers are included
    };
    onSubmit(dataToSubmit);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithInterviewData)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Revamp Your Resume</CardTitle>
            <CardDescription>Upload your current resume (PDF, DOCX, or TXT) and optionally a target job description for AI-powered enhancements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="resumeFile" // This field is for the input element only
              render={({ fieldState }) => ( // field is not used directly from render prop for file input
                <FormItem>
                  <FormLabel htmlFor="resume-upload" className="flex items-center space-x-2 cursor-pointer">
                    <UploadCloud className="h-5 w-5 text-primary" />
                    <span>Upload Resume (PDF, DOCX, TXT)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </FormControl>
                  {fileName && <p className="text-sm text-muted-foreground mt-1">Selected: {fileName}</p>}
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetJobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Job Description (Optional, but Recommended)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the target job description here for tailored suggestions..."
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-y-4">
            <Button type="submit" disabled={isSubmitting || !form.watch("resumeDataUri")} className="w-full md:w-auto">
              {isSubmitting ? "Processing..." : "Proceed to AI Interview & Revamp"}
            </Button>
             <p className="text-xs text-muted-foreground">
              Clicking "Proceed" will first parse your resume and then take you through a short AI-powered interview to gather more details for a highly personalized revamp.
            </p>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
