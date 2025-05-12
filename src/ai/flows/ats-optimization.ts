
'use server';

/**
 * @fileOverview A flow for optimizing a resume against a job description for ATS.
 * Provides a detailed analysis including an ATS match score.
 *
 * - atsOptimize - A function that handles the ATS optimization process.
 * - AtsOptimizeInput - The input type for the atsOptimize function.
 * - AtsOptimizeOutput - The return type for the atsOptimize function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AtsAnalysisDetailsSchema } // Assuming this is defined in lib/schemas
from '@/lib/schemas'; 
import { atsKeywordRetrieverTool, AtsKeywordRetrieverInputSchema } from '@/ai/tools/ats-keyword-retriever';

export const AtsOptimizeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume (preferably Markdown for better structure understanding).'),
  jobDescription: z.string().describe('The text content of the job description to optimize against.'),
});
export type AtsOptimizeInput = z.infer<typeof AtsOptimizeInputSchema>;

export const AtsOptimizeOutputSchema = z.object({
  optimizedResumeMarkdown: z.string().describe('The optimized resume content in Markdown format, with improvements applied.'),
  atsMatchScore: z.number().min(0).max(100).describe('An estimated ATS Match Score (0-100) based on keyword alignment, structure, and best practices.'),
  analysis: AtsAnalysisDetailsSchema.describe('A detailed analysis of the resume against the job description.')
});
export type AtsOptimizeOutput = z.infer<typeof AtsOptimizeOutputSchema>;

export async function atsOptimize(input: AtsOptimizeInput): Promise<AtsOptimizeOutput> {
  return atsOptimizeFlow(input);
}

const atsOptimizationPrompt = ai.definePrompt({
  name: 'atsOptimizationPrompt',
  input: { schema: AtsOptimizeInputSchema },
  output: { schema: AtsOptimizeOutputSchema },
  tools: [atsKeywordRetrieverTool],
  prompt: `You are an expert ATS (Applicant Tracking System) Resume Optimization Specialist.
Your goal is to analyze the provided resume against a specific job description, suggest and apply optimizations, and provide a detailed analysis including an ATS match score.

Resume Text (Markdown if possible):
\`\`\`
{{{resumeText}}}
\`\`\`

Job Description:
\`\`\`
{{{jobDescription}}}
\`\`\`

Optimization and Analysis Tasks:
1.  **Keyword Analysis & Integration**:
    *   Thoroughly analyze the job description to identify critical keywords, skills, and qualifications.
    *   Analyze the resume for the presence of these keywords.
    *   Use the 'atsKeywordRetrieverTool' with keywords extracted from the job description to get additional relevant ATS keyword suggestions.
    *   Naurally integrate missing critical keywords and suggested keywords into the resume text without making it sound forced or unnatural.
    *   Provide a list of keywords found, important missing keywords, and an optional keyword density assessment (conceptual score if direct calculation is hard).
2.  **Content Enhancement**:
    *   Rephrase bullet points and descriptions to use strong action verbs and quantify achievements where possible.
    *   Ensure the resume summary (if present) is tailored to the job description.
    *   Identify and suggest removal of weak language or clichés.
3.  **Structural & Formatting Review (for ATS)**:
    *   Advise on ATS-friendly formatting (though you'll output Markdown, your advice should reflect best practices for parsing, e.g., clear section headers, standard fonts (implied by Markdown), avoiding tables/columns if they hinder parsing).
    *   Check for logical flow and readability.
    *   Provide suggestions for formatting improvements for ATS compatibility.
4.  **Tone and Tense**:
    *   Ensure a professional tone.
    *   Verify consistent use of tense (e.g., past tense for past roles, present for current).
    *   Advocate for and apply active voice.
5.  **ATS Match Score**:
    *   Based on your comprehensive analysis (keyword alignment, structural integrity, content relevance, best practices), provide an estimated ATS Match Score between 0 and 100. Explain the basis for this score briefly.
6.  **Output**:
    *   **`optimizedResumeMarkdown`**: The full resume text with your optimizations applied, in MARKDOWN format.
    *   **`atsMatchScore`**: Your calculated score.
    *   **`analysis`**: A structured object containing:
        *   `strengths`: Positive aspects of the original or optimized resume.
        *   `keywordAnalysis`: object with `foundKeywords`, `missingKeywords`, `densityScore` (optional).
        *   `formattingSuggestions`: List of suggestions for ATS-friendly formatting.
        *   `toneAndTenseCheck`: Feedback on tone and tense.
        *   `generalSuggestions`: Any other actionable advice for improvement.

Produce the output as a single JSON object adhering to the defined output schema.
Prioritize actionable feedback and tangible improvements in the optimized resume.
`,
});

const atsOptimizeFlow = ai.defineFlow(
  {
    name: 'atsOptimizeFlow',
    inputSchema: AtsOptimizeInputSchema,
    outputSchema: AtsOptimizeOutputSchema,
  },
  async (input) => {
    const { output } = await atsOptimizationPrompt(input);
    if (!output?.optimizedResumeMarkdown || typeof output?.atsMatchScore !== 'number' || !output?.analysis) {
      throw new Error('AI failed to perform ATS optimization or provide complete analysis.');
    }
    return output;
  }
);