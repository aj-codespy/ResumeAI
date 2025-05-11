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

export const GenerateResumeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactInfo: z.string().min(1, 'Contact information is required'),
  targetJobTitle: z.string().min(1, 'Target job title is required'),
  yearsOfExperience: z.coerce.number().min(0, 'Years of experience must be non-negative'),
  careerLevel: z.enum(['Beginner', 'Mid-Level', 'Executive']),
  education: z.array(EducationEntrySchema).min(1, "At least one education entry is required"),
  workExperience: z.array(WorkExperienceEntrySchema).min(1, "At least one work experience entry is required"),
  skills: z.string().min(1, 'Skills are required (comma-separated)'),
  projects: z.string().optional(),
  certifications: z.string().optional(),
  jobDescription: z.string().optional(),
  emphasisSkills: z.string().optional(),
});

export type GenerateResumeFormData = z.infer<typeof GenerateResumeFormSchema>;

export const RevampResumeFormSchema = z.object({
  resumeText: z.string().min(50, 'Resume text must be at least 50 characters'),
  targetJobDescription: z.string().optional(),
});

export type RevampResumeFormData = z.infer<typeof RevampResumeFormSchema>;
