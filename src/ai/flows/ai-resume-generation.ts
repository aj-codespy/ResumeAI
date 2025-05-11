'use server';
/**
 * @fileOverview AI-powered resume generation flow.
 *
 * - generateTailoredResume - A function that generates a tailored resume based on user inputs.
 * - GenerateTailoredResumeInput - The input type for the generateTailoredResume function.
 * - GenerateTailoredResumeOutput - The return type for the generateTailoredResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTailoredResumeInputSchema = z.object({
  name: z.string().describe('The full name of the user.'),
  contactInfo: z.string().describe('The contact information of the user (email, phone number, LinkedIn profile URL).'),
  targetJobTitle: z.string().describe('The target job title for the resume.'),
  yearsOfExperience: z.number().describe('The number of years of experience the user has.'),
  careerLevel: z.enum(['Beginner', 'Mid-Level', 'Executive']).describe('The career level of the user.'),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    graduationDate: z.string(),
  })).describe('The education history of the user.'),
  workExperience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    dates: z.string(),
    responsibilities: z.string(),
  })).describe('The work experience history of the user.'),
  skills: z.array(z.string()).describe('The skills of the user.'),
  projects: z.array(z.string()).describe('The projects the user has worked on.'),
  certifications: z.array(z.string()).describe('The certifications the user has.'),
  jobDescription: z.string().optional().describe('Optional job description to tailor the resume to.'),
  emphasisSkills: z.array(z.string()).describe('Skills to be emphasized in the resume'),
});
export type GenerateTailoredResumeInput = z.infer<typeof GenerateTailoredResumeInputSchema>;

const GenerateTailoredResumeOutputSchema = z.object({
  resume: z.string().describe('The generated resume.'),
});
export type GenerateTailoredResumeOutput = z.infer<typeof GenerateTailoredResumeOutputSchema>;

export async function generateTailoredResume(input: GenerateTailoredResumeInput): Promise<GenerateTailoredResumeOutput> {
  return generateTailoredResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTailoredResumePrompt',
  input: {schema: GenerateTailoredResumeInputSchema},
  output: {schema: GenerateTailoredResumeOutputSchema},
  prompt: `You are an AI resume writer. You will generate a resume based on the information provided.

  Name: {{{name}}}
  Contact Information: {{{contactInfo}}}
  Target Job Title: {{{targetJobTitle}}}
  Years of Experience: {{{yearsOfExperience}}}
  Career Level: {{{careerLevel}}}
  Education: {{#each education}}{{{institution}}}, {{{degree}}}, {{{graduationDate}}}
  {{/each}}
  Work Experience: {{#each workExperience}}{{{company}}}, {{{role}}}, {{{dates}}}, {{{responsibilities}}}
  {{/each}}
  Skills: {{#each skills}}{{{this}}}, {{/each}}
  Projects: {{#each projects}}{{{this}}}, {{/each}}
  Certifications: {{#each certifications}}{{{this}}}, {{/each}}
  Job Description: {{{jobDescription}}}
  Skills to Emphasize: {{#each emphasisSkills}}{{{this}}}, {{/each}}

  Please generate a resume tailored to the target job title and career level, emphasizing the specified skills, using the provided information.  The resume should be well-formatted and easy to read.  Make sure to include all provided information.
  `,
});

const generateTailoredResumeFlow = ai.defineFlow(
  {
    name: 'generateTailoredResumeFlow',
    inputSchema: GenerateTailoredResumeInputSchema,
    outputSchema: GenerateTailoredResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
