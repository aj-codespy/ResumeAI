// src/ai/flows/resume-revamping.ts
'use server';

/**
 * @fileOverview AI-powered resume revamping flow.
 *
 * - revampResume - Analyzes and suggests enhancements for a given resume.
 * - RevampResumeInput - The input type for the revampResume function.
 * - RevampResumeOutput - The return type for the revampResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RevampResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be revamped.'),
  targetJobDescription: z
    .string()
    .optional()
    .describe('Optional job description to tailor the resume towards.'),
});
export type RevampResumeInput = z.infer<typeof RevampResumeInputSchema>;

const RevampResumeOutputSchema = z.object({
  revampedResume: z.string().describe('The revamped resume with suggested enhancements.'),
  suggestions: z.array(z.string()).describe('Specific suggestions for improvement.'),
});
export type RevampResumeOutput = z.infer<typeof RevampResumeOutputSchema>;

export async function revampResume(input: RevampResumeInput): Promise<RevampResumeOutput> {
  return revampResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'revampResumePrompt',
  input: {schema: RevampResumeInputSchema},
  output: {schema: RevampResumeOutputSchema},
  prompt: `You are an AI resume expert. Analyze the provided resume and suggest enhancements to make it more effective. Consider ATS best practices, keyword optimization, and overall impact.

  Resume Text: {{{resumeText}}}

  {% if targetJobDescription %}
  Tailor the suggestions towards the following job description:
  {{{targetJobDescription}}}
  {% endif %}

  Provide the revamped resume and a list of specific suggestions.
  `, // Corrected Handlebars syntax
});

const revampResumeFlow = ai.defineFlow(
  {
    name: 'revampResumeFlow',
    inputSchema: RevampResumeInputSchema,
    outputSchema: RevampResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
