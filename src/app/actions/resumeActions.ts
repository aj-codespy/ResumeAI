
"use server";

import { 
  generateTailoredResume, 
  GenerateTailoredResumeInput 
} from "@/ai/flows/ai-resume-generation";
import { 
  revampResume, 
  RevampResumeInput,
  RevampResumeOutputSchema
} from "@/ai/flows/resume-revamping";
import { 
  parseResume, 
  ParseResumeInput,
  ParseResumeOutput 
} from "@/ai/flows/resume-parser";
import { 
  generateInterviewQuestions, 
  GenerateInterviewQuestionsInput,
  GenerateInterviewQuestionsOutput
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
  AtsAnalysisDetails,
  ResumeSchema // For Supabase operations
} from "@/lib/schemas";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { marked } from 'marked';
import puppeteer from 'puppeteer-core'; // Using puppeteer-core
import chromium from '@sparticuz/chromium-min'; // Using @sparticuz/chromium-min
import htmlToDocx from 'html-to-docx';


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
      careerLevel: parsedDataForRevamp.experience && parsedDataForRevamp.experience.length > 0 ? 'Mid-Level' : 'Beginner', 
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
    const input: GenerateInterviewQuestionsInput = { ...data, count: 15 };
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

// Export Actions
export interface ExportResumeResult {
  success: boolean;
  fileBuffer?: string; // Base64 encoded string
  fileName?: string;
  contentType?: string;
  error?: string;
}

async function getBrowser() {
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
}

export async function exportResumeAsPdf(markdownContent: string): Promise<ExportResumeResult> {
  try {
    const htmlContent = marked.parse(markdownContent);
    // Basic styling for the PDF
    const styledHtml = `
      <html>
        <head>
          <style>
            body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; padding: 20px; }
            h1, h2, h3 { margin-bottom: 0.5em; }
            h1 { font-size: 24px; }
            h2 { font-size: 20px; }
            h3 { font-size: 16px; }
            ul { padding-left: 20px; }
            p { margin-bottom: 1em; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;

    let browser;
    try {
      browser = await getBrowser();
      const page = await browser.newPage();
      await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      return {
        success: true,
        fileBuffer: pdfBuffer.toString('base64'),
        fileName: 'resume.pdf',
        contentType: 'application/pdf',
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    console.error("Error exporting resume as PDF:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to export resume as PDF." };
  }
}

export async function exportResumeAsDocx(markdownContent: string): Promise<ExportResumeResult> {
  try {
    const htmlContent = marked.parse(markdownContent);
    // Basic HTML structure for DOCX conversion
     const styledHtml = `
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>${htmlContent}</body>
      </html>
    `;
    const docxBuffer = await htmlToDocx(styledHtml, undefined, {
      table: { row: { cantSplit: true } },
      footer: false,
      header: false,
    });
    
    if (!(docxBuffer instanceof Buffer)) {
        throw new Error("html-to-docx did not return a Buffer.");
    }

    return {
      success: true,
      fileBuffer: docxBuffer.toString('base64'),
      fileName: 'resume.docx',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  } catch (error) {
    console.error("Error exporting resume as DOCX:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to export resume as DOCX." };
  }
}


// Supabase CRUD actions for resumes
export interface SaveResumeResult {
  success: boolean;
  resumeId?: string;
  error?: string;
}

export async function saveResume(
  resumeData: Omit<ResumeSchema, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<SaveResumeResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }
  if (user.id !== resumeData.user_id) {
    return { success: false, error: "User ID mismatch."};
  }

  try {
    if (resumeData.id) { // Update existing resume
      const { data, error } = await supabase
        .from('resumes')
        .update({
          resume_name: resumeData.resume_name,
          markdown_content: resumeData.markdown_content,
          json_data: resumeData.json_data,
          ats_score: resumeData.ats_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resumeData.id)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (error) throw error;
      return { success: true, resumeId: data.id };
    } else { // Create new resume
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          resume_name: resumeData.resume_name,
          markdown_content: resumeData.markdown_content,
          json_data: resumeData.json_data,
          ats_score: resumeData.ats_score,
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return { success: true, resumeId: data.id };
    }
  } catch (error) {
    console.error("Error saving resume:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save resume." };
  }
}

export interface ListResumesResult {
  success: boolean;
  resumes?: ResumeSchema[];
  error?: string;
}

export async function listUserResumes(): Promise<ListResumesResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, resumes: data as ResumeSchema[] };
  } catch (error) {
    console.error("Error listing resumes:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to list resumes." };
  }
}

export interface GetResumeResult {
  success: boolean;
  resume?: ResumeSchema;
  error?: string;
}
export async function getResumeDetails(resumeId: string): Promise<GetResumeResult> {
  const supabase = createClient();
   const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { success: true, resume: data as ResumeSchema };
  } catch (error) {
    console.error("Error fetching resume details:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch resume details." };
  }
}

export interface DeleteResumeResult {
    success: boolean;
    error?: string;
}
export async function deleteResume(resumeId: string): Promise<DeleteResumeResult> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated." };
    }

    try {
        const { error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', resumeId)
            .eq('user_id', user.id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error deleting resume:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete resume." };
    }
}

