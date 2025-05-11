// src/ai/flows/ai-bullet-point-enhancer.ts
'use server';

/**
 * @fileOverview A flow that enhances bullet points to be more impactful and use strong action verbs.
 *
 * - enhanceBulletPoint - A function that takes a draft bullet point and rewrites it.
 * - EnhanceBulletPointInput - The input type for the enhanceBulletPoint function.
 * - EnhanceBulletPointOutput - The return type for the enhanceBulletPoint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceBulletPointInputSchema = z.string().describe('A draft bullet point or a description of a task/achievement.');
export type EnhanceBulletPointInput = z.infer<typeof EnhanceBulletPointInputSchema>;

const EnhanceBulletPointOutputSchema = z.string().describe('The rewritten bullet point that is more impactful and uses strong action verbs.');
export type EnhanceBulletPointOutput = z.infer<typeof EnhanceBulletPointOutputSchema>;

export async function enhanceBulletPoint(input: EnhanceBulletPointInput): Promise<EnhanceBulletPointOutput> {
  return enhanceBulletPointFlow(input);
}

const enhanceBulletPointPrompt = ai.definePrompt({
  name: 'enhanceBulletPointPrompt',
  input: {schema: EnhanceBulletPointInputSchema},
  output: {schema: EnhanceBulletPointOutputSchema},
  prompt: `Rewrite the following bullet point to be more impactful and use strong action verbs:

{{{input}}}`,
});

const enhanceBulletPointFlow = ai.defineFlow(
  {
    name: 'enhanceBulletPointFlow',
    inputSchema: EnhanceBulletPointInputSchema,
    outputSchema: EnhanceBulletPointOutputSchema,
  },
  async input => {
    const {output} = await enhanceBulletPointPrompt(input);
    return output!;
  }
);
