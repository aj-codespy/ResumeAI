
"use server";

import { 
  generateTailoredResume, 
  GenerateTailoredResumeInput 
} from "@/ai/flows/ai-resume-generation";
import { 
  revampResume, 
  RevampResumeInput,
  RevampResumeOutputSchema // For result type
} from "@/ai/flows/resume-revamping";
import { 
  parseResume, 
  ParseResumeInput,
  ParseResumeOutput // For result type
} from "@/ai/flows/resume-parser";
import { 
  generateInterviewQuestions, 
  GenerateInterviewQuestionsInput,
  GenerateInterviewQuestionsOutput // For result type
} from "@/ai/flows/interview-question-generator";
import {
  atsOptimize,
  AtsOptimizeInput,
  AtsOptimizeOutput
} from "@/ai/flows/ats-optimization";

import type { 
  GenerateResumeFormData, 
  RevampResumeFormData,
  GenerateInterviewQuestionsFormData,
  ParsedResumeData,
  AtsAnalysisDetails
} from "@/lib/schemas";
import { z } from "zod";

export interface GenerateResumeActionResult {
  success: boolean;
  resumeMarkdown?: string;
  error?: string;
}

export async function generateResumeAction(data: GenerateResumeFormData): Promise<GenerateResumeActionResult> {
  try {
    const skillsArray = data.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    const projectsArray = data.projects?.split(',').map(proj => proj.trim()).filter(proj => proj) || [];
    const certificationsArray = data.certifications?.split(',').map(cert => cert.trim()).filter(cert => cert) || [];
    const emphasisSkillsArray = data.emphasisSkills?.split(',').map(skill => skill.trim()).filter(skill => skill) || [];
    
    const input: GenerateTailoredResumeInput = {
      ...data,
      skills: skillsArray,
      projects: projectsArray,
      certifications: certificationsArray,
      emphasisSkills: emphasisSkillsArray,
      // linkedinProfileUrl and interviewAnswers are directly from data if present
    };

    const result = await generateTailoredResume(input);
    return { success: true, resumeMarkdown: result.resumeMarkdown };
  } catch (error) {
    console.error("Error in generateResumeAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during resume generation." };
  }
}

export interface ParseResumeActionResult {
  success: boolean;
  parsedData?: ParsedResumeData;
  error?: string;
}

export async function parseResumeAction(data: { resumeDataUri: string; fileType: 'pdf' | 'docx' | 'txt' }): Promise<ParseResumeActionResult> {
  try {
    const input: ParseResumeInput = {
      resumeDataUri: data.resumeDataUri,
      fileType: data.fileType,
    };
    const result = await parseResume(input);
    return { success: true, parsedData: result };
  } catch (error) {
    console.error("Error in parseResumeAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during resume parsing." };
  }
}


export interface RevampResumeActionResult {
  success: boolean;
  revampedResumeMarkdown?: string;
  suggestions?: string[];
  error?: string;
}

export async function revampResumeAction(data: RevampResumeFormData): Promise<RevampResumeActionResult> {
  try {
    let parsedDataForRevamp: ParsedResumeData | undefined = data.parsedResumeData;

    // If resumeDataUri and fileType are provided, parse it first
    if (data.resumeDataUri && data.fileType && !parsedDataForRevamp) {
      const parseResult = await parseResumeAction({ resumeDataUri: data.resumeDataUri, fileType: data.fileType });
      if (!parseResult.success || !parseResult.parsedData) {
        return { success: false, error: parseResult.error || "Failed to parse resume before revamping." };
      }
      parsedDataForRevamp = parseResult.parsedData;
    }

    if (!parsedDataForRevamp) {
      return { success: false, error: "No resume data available to revamp. Please upload a resume or ensure parsing was successful." };
    }
    
    const input: RevampResumeInput = {
      parsedResumeData: parsedDataForRevamp,
      targetJobDescription: data.targetJobDescription,
      interviewAnswers: data.interviewAnswers,
      // Optionally pass careerLevel and targetJobTitle if available from form/context
      careerLevel: parsedDataForRevamp.experience && parsedDataForRevamp.experience.length > 0 ? 'Mid-Level' : 'Beginner', // Basic inference
      targetJobTitle: parsedDataForRevamp.experience?.[0]?.role || undefined 
    };

    const result = await revampResume(input);
    return { success: true, revampedResumeMarkdown: result.revampedResumeMarkdown, suggestions: result.suggestions };
  } catch (error) {
    console.error("Error in revampResumeAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during resume revamping." };
  }
}

export interface GenerateInterviewQuestionsActionResult {
  success: boolean;
  questions?: string[];
  error?: string;
}

export async function generateInterviewQuestionsAction(data: GenerateInterviewQuestionsFormData): Promise<GenerateInterviewQuestionsActionResult> {
  try {
    const input: GenerateInterviewQuestionsInput = { ...data, count: 15 }; // Ensure count is 15 as per requirement
    const result = await generateInterviewQuestions(input);
    return { success: true, questions: result.questions };
  } catch (error) {
    console.error("Error in generateInterviewQuestionsAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during question generation." };
  }
}

export interface AtsOptimizeActionResult {
  success: boolean;
  optimizedResumeMarkdown?: string;
  atsMatchScore?: number;
  analysis?: AtsAnalysisDetails;
  error?: string;
}

export async function atsOptimizeAction(data: { resumeText: string; jobDescription: string }): Promise<AtsOptimizeActionResult> {
  try {
    const input: AtsOptimizeInput = data;
    const result = await atsOptimize(input);
    return { 
      success: true, 
      optimizedResumeMarkdown: result.optimizedResumeMarkdown,
      atsMatchScore: result.atsMatchScore,
      analysis: result.analysis 
    };
  } catch (error) {
    console.error("Error in atsOptimizeAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during ATS optimization." };
  }
}