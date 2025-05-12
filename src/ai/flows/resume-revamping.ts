
// src/ai/flows/resume-revamping.ts
'use server';

/**
 * @fileOverview AI-powered resume revamping flow.
 *
 * - revampResume - Analyzes and suggests enhancements for a given parsed resume.
 * - RevampResumeInput - The input type for the revampResume function.
 * - RevampResumeOutput - The return type for the revampResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ParsedResumeDataSchema } from '@/lib/schemas';
import { atsKeywordRetrieverTool } from '@/ai/tools/ats-keyword-retriever';


export const RevampResumeInputSchema = z.object({
  parsedResumeData: ParsedResumeDataSchema.describe('The structured JSON data of the resume to be revamped. This comes from the resume-parser flow.'),
  targetJobDescription: z
    .string()
    .optional()
    .describe('Optional job description to tailor the resume towards.'),
  interviewAnswers: z.array(z.object({ question: z.string(), answer: z.string() })).optional().describe("Answers to a personalized questionnaire for deeper insights."),
  careerLevel: z.enum(['Beginner', 'Mid-Level', 'Executive', 'Student/Intern']).optional().describe('User career level, if known, to guide tone and focus.'),
  targetJobTitle: z.string().optional().describe('Target job title, if known.'),
  selectedModel: z.string().optional().describe("Optional: Specify a Genkit model name.")
});
export type RevampResumeInput = z.infer<typeof RevampResumeInputSchema>;

export const RevampResumeOutputSchema = z.object({
  revampedResumeMarkdown: z.string().describe('The revamped resume in Markdown format with suggested enhancements applied.'),
  suggestions: z.array(z.string()).describe('Specific suggestions for areas of improvement, highlighting what was changed and why, or what could still be improved.'),
});
export type RevampResumeOutput = z.infer<typeof RevampResumeOutputSchema>;

export async function revampResume(input: RevampResumeInput): Promise<RevampResumeOutput> {
  return revampResumeFlow(input);
}

const revampPrompt = ai.definePrompt({
  name: 'revampResumePrompt',
  input: { schema: RevampResumeInputSchema },
  output: { schema: RevampResumeOutputSchema },
  tools: [atsKeywordRetrieverTool],
  prompt: `You are an expert AI Resume Revamping Agent. Your task is to analyze the provided parsed resume data, incorporate insights from interview answers (if any), and significantly improve it, outputting a revamped resume in MARKDOWN format.
If a target job description is provided, the revamp should be heavily tailored towards it. Use standard, ATS-friendly fonts implicitly (e.g., Helvetica, Arial, Calibri) by using clean Markdown.

Parsed Resume Data:
\`\`\`json
{{{JSONstringify parsedResumeData}}}
\`\`\`

{{#if targetJobTitle}}Target Job Title: {{{targetJobTitle}}}{{/if}}
{{#if careerLevel}}User Career Level: {{{careerLevel}}}{{/if}}

{{#if interviewAnswers}}
Deeper Insights from User Interview:
{{#each interviewAnswers}}  - Q: {{{question}}}
    A: {{{answer}}}
{{/each}}
- Integrate these insights to strengthen achievements, personalize the summary, and ensure skills are well-represented.
{{/if}}

{{#if targetJobDescription}}
Target Job Description for Tailoring:
\`\`\`
{{{targetJobDescription}}}
\`\`\`
- Analyze this JD thoroughly. Identify key skills, experiences, and qualifications sought.
- Use the 'atsKeywordRetrieverTool' with keywords from this job description to get ATS keyword suggestions.
{{else}}
- No specific job description provided. Focus on general improvements for the user's career path based on their resume (and career level if provided) and interview answers. Use the 'atsKeywordRetrieverTool' with the job title from the parsed resume (if available, or {{{targetJobTitle}}} if provided) or a general job title inferred from the content to get relevant ATS keyword suggestions.
{{/if}}

Revamping Instructions:
1.  **Structure and Content Analysis**:
    *   Identify weak phrasing, passive voice, and generic statements in the original resume.
    *   Pinpoint areas where achievements can be quantified or made more impactful.
    *   Check for consistency in tone and tense.
    *   Assess section order. If 'careerLevel' is 'Student/Intern' or 'Beginner' with limited experience, ensure Education and Projects are appropriately prominent. For 'Mid-Level' or 'Executive', Work Experience should typically lead after the summary.
2.  **Enhancements to Apply**:
    *   **Rewrite for Impact**: Rephrase bullet points using strong action verbs. Focus on results and accomplishments (STAR method).
    *   **Keyword Optimization**: Integrate relevant keywords from the JD (if provided) and suggestions from the 'atsKeywordRetrieverTool'. Ensure natural incorporation.
    *   **Summary Improvement**: Rewrite or refine the professional summary to be concise, powerful, and tailored, using interview insights and targeting the '{{targetJobTitle}}' (if known).
    *   **Skills Section**: Ensure the skills section is comprehensive and highlights skills relevant to the target role/JD. Consider categorizing skills.
    *   **ATS Compliance**: Ensure the revamped content is ATS-friendly (clear headings, standard terminology, good use of bullet points, appropriate section order for {{{careerLevel}}}).
    *   **Personalization**: Weave in details from the interview answers to make the resume more compelling and authentic.
3.  **Output Format**:
    *   **`revampedResumeMarkdown`**: Provide the FULL revamped resume in well-structured MARKDOWN format.
    *   **`suggestions`**: Provide a list of concise, actionable suggestions. These should explain key changes made (e.g., "Strengthened the summary by incorporating your project leadership example from the interview") and may also point out areas where the user could add more specific details if they have them (e.g., "Consider adding specific metrics to the achievement under Project X if available."). If structural changes were made due to career level, mention this (e.g., "Reordered sections to prioritize Education for your current career stage.").

Focus on transforming the resume into a top-tier document.
Output ONLY the JSON object with 'revampedResumeMarkdown' and 'suggestions' keys.
`,
});

const revampResumeFlow = ai.defineFlow(
  {
    name: 'revampResumeFlow',
    inputSchema: RevampResumeInputSchema,
    outputSchema: RevampResumeOutputSchema,
  },
  async (input) => {
    const modelToUse = input.selectedModel || process.env.GENKIT_DEFAULT_MODEL || 'googleai/gemini-2.0-flash';
    
    const { output } = await ai.generate({
        prompt: revampPrompt.prompt!,
        model: modelToUse,
        input: input,
        output: { schema: RevampResumeOutputSchema },
        tools: [atsKeywordRetrieverTool],
    });

    if (!output?.revampedResumeMarkdown || !output?.suggestions) {
      throw new Error("AI failed to revamp resume or provide suggestions.");
    }
    return output;
  }
);

if (typeof Handlebars !== 'undefined') {
  Handlebars.registerHelper('JSONstringify', function(context) {
    return JSON.stringify(context, null, 2);
  });
   Handlebars.registerHelper('eq', function (a:any, b:any) {
    return a === b;
  });
}
