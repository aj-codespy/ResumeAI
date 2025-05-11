"use server";

import { generateTailoredResume, GenerateTailoredResumeInput } from "@/ai/flows/ai-resume-generation";
import { revampResume, RevampResumeInput } from "@/ai/flows/resume-revamping";
import type { GenerateResumeFormData, RevampResumeFormData } from "@/lib/schemas";

export interface GenerateResumeActionResult {
  success: boolean;
  resume?: string;
  error?: string;
}

export async function generateResumeAction(data: GenerateResumeFormData): Promise<GenerateResumeActionResult> {
  try {
    // Transform form data skills (comma-separated strings) to arrays of strings
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
    return { success: true, resume: result.resume };
  } catch (error) {
    console.error("Error in generateResumeAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during resume generation." };
  }
}

export interface RevampResumeActionResult {
  success: boolean;
  revampedResume?: string;
  suggestions?: string[];
  error?: string;
}

export async function revampResumeAction(data: RevampResumeFormData): Promise<RevampResumeActionResult> {
  try {
    const input: RevampResumeInput = {
      resumeText: data.resumeText,
      targetJobDescription: data.targetJobDescription,
    };
    const result = await revampResume(input);
    return { success: true, revampedResume: result.revampedResume, suggestions: result.suggestions };
  } catch (error) {
    console.error("Error in revampResumeAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during resume revamping." };
  }
}
