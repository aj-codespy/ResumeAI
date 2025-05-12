import { z } from 'zod';

export const EducationEntrySchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  graduationDate: z.string().min(1, "Graduation date is required"),
});
export type EducationEntry = z.infer<typeof EducationEntrySchema>;

export const WorkExperienceEntrySchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  dates: z.string().min(1, "Dates are required"),
  responsibilities: z.string().min(1, "Responsibilities are required"),
});
export type WorkExperienceEntry = z.infer<typeof WorkExperienceEntrySchema>;

export const InterviewAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type InterviewAnswer = z.infer<typeof InterviewAnswerSchema>;

export const GenerateResumeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactInfo: z.string().min(1, 'Contact information is required'), // Expects "Email, Phone, LinkedIn URL"
  targetJobTitle: z.string().min(1, 'Target job title is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be non-negative'),
  careerLevel: z.enum(['Beginner', 'Mid-Level', 'Executive']),
  education: z.array(EducationEntrySchema).min(1, "At least one education entry is required"),
  workExperience: z.array(WorkExperienceEntrySchema).min(1, "At least one work experience entry is required"),
  skills: z.string().min(1, 'Skills are required (comma-separated)'),
  projects: z.string().optional(),
  certifications: z.string().optional(),
  jobDescription: z.string().optional(), // JD for tailoring
  emphasisSkills: z.string().optional(), // Skills to emphasize
  linkedinProfileUrl: z.string().url().optional().describe("Optional LinkedIn profile URL for additional context."),
  interviewAnswers: z.array(InterviewAnswerSchema).optional().describe("Answers to the intelligent questionnaire."),
});

export type GenerateResumeFormData = z.infer<typeof GenerateResumeFormSchema>;


// Schema for the output of the resume parser flow
export const ParsedSectionSchema = z.object({ 
  title: z.string().optional(), 
  content: z.string() 
});

export const ParsedExperienceSchema = z.object({
  role: z.string().optional(),
  company: z.string().optional(),
  dates: z.string().optional(),
  description: z.string().optional()
});

export const ParsedEducationSchema = z.object({
  institution: z.string().optional(),
  degree: z.string().optional(),
  graduationDate: z.string().optional()
});

export const ParsedProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});

export const ParsedResumeDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedin: z.string().url().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(ParsedExperienceSchema).optional(),
  education: z.array(ParsedEducationSchema).optional(),
  projects: z.array(ParsedProjectSchema).optional(),
  certifications: z.array(z.string()).optional(),
  otherSections: z.array(ParsedSectionSchema).optional().describe("Any other recognized sections."),
  rawText: z.string().describe("The full raw text extracted from the document, for fallback or detailed review.")
}).describe("Structured JSON representation of the resume.");
export type ParsedResumeData = z.infer<typeof ParsedResumeDataSchema>;


export const RevampResumeFormSchema = z.object({
  // resumeText: z.string().min(50, 'Resume text must be at least 50 characters'), // To be replaced by parsed data
  resumeFile: z.any().optional().describe("The uploaded resume file (PDF, DOCX, TXT). Handled by client for data URI conversion."),
  resumeDataUri: z.string().optional().describe("Data URI of the resume file if already processed."),
  fileType: z.enum(['pdf', 'docx', 'txt']).optional().describe("Type of the uploaded file."),
  parsedResumeData: ParsedResumeDataSchema.optional().describe("Pre-parsed resume data, result of parsing flow."),
  targetJobDescription: z.string().optional(),
  interviewAnswers: z.array(InterviewAnswerSchema).optional().describe("Answers to the intelligent questionnaire."),
});
export type RevampResumeFormData = z.infer<typeof RevampResumeFormSchema>;


// Schema for Interview Question Generator
export const GenerateInterviewQuestionsFormSchema = z.object({
  domain: z.string().optional().describe("User's industry or domain."),
  experienceLevel: z.string().optional().describe("User's career level (e.g., Beginner, Mid-Level, Executive)."),
  targetRole: z.string().optional().describe("The job role the user is applying for."),
  existingResumeSummary: z.string().optional().describe("Summary from an existing resume, if available.")
});
export type GenerateInterviewQuestionsFormData = z.infer<typeof GenerateInterviewQuestionsFormSchema>;


// Schema for ATS Optimization - Input already exists, Output needs update
export const AtsKeywordAnalysisSchema = z.object({
  foundKeywords: z.array(z.string()).describe('Keywords from job description found in resume.'),
  missingKeywords: z.array(z.string()).describe('Important keywords from job description missing in resume.'),
  densityScore: z.number().min(0).max(1).optional().describe('Keyword density score (0-1), if calculable.')
}).describe('Analysis of keywords.');

export const AtsAnalysisDetailsSchema = z.object({
  strengths: z.array(z.string()).describe('Identified strengths of the resume.'),
  keywordAnalysis: AtsKeywordAnalysisSchema,
  formattingSuggestions: z.array(z.string()).describe('Suggestions for formatting improvements for ATS.'),
  toneAndTenseCheck: z.array(z.string()).describe('Feedback on tone and tense, advocating for active voice.'),
  generalSuggestions: z.array(z.string()).describe('Other suggestions for improvement.')
});
export type AtsAnalysisDetails = z.infer<typeof AtsAnalysisDetailsSchema>;