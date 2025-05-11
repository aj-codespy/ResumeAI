'use server';

/**
 * @fileOverview A flow for optimizing a resume against a job description for ATS.
 *
 * - atsOptimize - A function that handles the ATS optimization process.
 * - AtsOptimizeInput - The input type for the atsOptimize function.
 * - AtsOptimizeOutput - The return type for the atsOptimize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AtsOptimizeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The text content of the job description.'),
});
export type AtsOptimizeInput = z.infer<typeof AtsOptimizeInputSchema>;

const AtsOptimizeOutputSchema = z.object({
  optimizedResume: z.string().describe('The optimized resume content.'),
  analysis: z.string().describe('An analysis of the resume against the job description, including missing keywords and areas for improvement.'),
});
export type AtsOptimizeOutput = z.infer<typeof AtsOptimizeOutputSchema>;

export async function atsOptimize(input: AtsOptimizeInput): Promise<AtsOptimizeOutput> {
  return atsOptimizeFlow(input);
}

const atsOptimizationPrompt = ai.definePrompt({
  name: 'atsOptimizationPrompt',
  input: {schema: AtsOptimizeInputSchema},
  output: {schema: AtsOptimizeOutputSchema},
  prompt: `You are an expert resume optimization specialist. Your goal is to help users tailor their resumes to specific job descriptions in order to improve their chances of getting through Applicant Tracking Systems (ATS).

  Analyze the provided resume text against the job description, and provide an optimized version of the resume that is tailored to the job description. Also, provide an analysis of the resume against the job description, including missing keywords and areas for improvement.

  Resume Text:
  {{resumeText}}

  Job Description:
  {{jobDescription}}

  Focus on incorporating relevant keywords from the job description into the resume, and on rephrasing the resume to better match the language and requirements of the job description.

  Ensure that the optimized resume is well-formatted and easy to read.
  `,
});

const atsOptimizeFlow = ai.defineFlow(
  {
    name: 'atsOptimizeFlow',
    inputSchema: AtsOptimizeInputSchema,
    outputSchema: AtsOptimizeOutputSchema,
  },
  async input => {
    const {output} = await atsOptimizationPrompt(input);
    return output!;
  }
);
