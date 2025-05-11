// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview A Genkit flow for grammar and tone correction in resume sections.
 *
 * - correctGrammarAndTone - A function that corrects grammar, spelling, and tone of text.
 * - CorrectGrammarAndToneInput - The input type for the correctGrammarAndTone function.
 * - CorrectGrammarAndToneOutput - The return type for the correctGrammarAndTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectGrammarAndToneInputSchema = z.object({
  text: z.string().describe('The text to be corrected.'),
  tone: z
    .enum(['professional', 'creative', 'executive'])
    .describe('The desired tone for the text.'),
});
export type CorrectGrammarAndToneInput = z.infer<typeof CorrectGrammarAndToneInputSchema>;

const CorrectGrammarAndToneOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text.'),
});
export type CorrectGrammarAndToneOutput = z.infer<typeof CorrectGrammarAndToneOutputSchema>;

export async function correctGrammarAndTone(
  input: CorrectGrammarAndToneInput
): Promise<CorrectGrammarAndToneOutput> {
  return correctGrammarAndToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctGrammarAndTonePrompt',
  input: {schema: CorrectGrammarAndToneInputSchema},
  output: {schema: CorrectGrammarAndToneOutputSchema},
  prompt: `Correct the grammar and spelling of the following text. Ensure the tone is {{{tone}}}.\n\nText: {{{text}}}`,
});

const correctGrammarAndToneFlow = ai.defineFlow(
  {
    name: 'correctGrammarAndToneFlow',
    inputSchema: CorrectGrammarAndToneInputSchema,
    outputSchema: CorrectGrammarAndToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
