// src/ai/flows/ai-summary-generator.ts
'use server';

/**
 * @fileOverview Generates a professional resume summary based on key achievements,
 * experience highlights, and the target role.
 *
 * - generateResumeSummary - A function that generates a resume summary.
 * - GenerateResumeSummaryInput - The input type for the generateResumeSummary function.
 * - GenerateResumeSummaryOutput - The return type for the generateResumeSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeSummaryInputSchema = z.object({
  keyAchievements: z
    .string()
    .describe('Key achievements and accomplishments.'),
  experienceHighlights: z
    .string()
    .describe('Highlights of work experience.'),
  targetRole: z.string().describe('The target job role.'),
});
export type GenerateResumeSummaryInput = z.infer<
  typeof GenerateResumeSummaryInputSchema
>;

const GenerateResumeSummaryOutputSchema = z.object({
  summary: z.string().describe('A professional resume summary.'),
});
export type GenerateResumeSummaryOutput = z.infer<
  typeof GenerateResumeSummaryOutputSchema
>;

export async function generateResumeSummary(
  input: GenerateResumeSummaryInput
): Promise<GenerateResumeSummaryOutput> {
  return generateResumeSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeSummaryPrompt',
  input: {schema: GenerateResumeSummaryInputSchema},
  output: {schema: GenerateResumeSummaryOutputSchema},
  prompt: `You are a professional resume writer. Generate a compelling resume summary for a candidate targeting the role of {{targetRole}}, highlighting their key achievements: {{keyAchievements}}, and experience highlights: {{experienceHighlights}}. The summary should be concise, engaging, and tailored to capture the attention of recruiters. Focus on quantifying achievements whenever possible and aligning the summary with the desired job role.`,
});

const generateResumeSummaryFlow = ai.defineFlow(
  {
    name: 'generateResumeSummaryFlow',
    inputSchema: GenerateResumeSummaryInputSchema,
    outputSchema: GenerateResumeSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
