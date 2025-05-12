// src/ai/flows/interview-question-generator.ts
'use server';
/**
 * @fileOverview A Genkit flow to generate dynamic interview-style questions
 * to gather more personalized information for resume building/revamping.
 *
 * - generateInterviewQuestions - The main function to generate questions.
 * - GenerateInterviewQuestionsInput - Input type for the function.
 * - GenerateInterviewQuestionsOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateInterviewQuestionsInputSchema = z.object({
  domain: z.string().optional().describe("User's industry or domain (e.g., 'Software Engineering', 'Healthcare', 'Marketing')."),
  experienceLevel: z.enum(['Beginner', 'Mid-Level', 'Executive', 'Student/Intern']).optional().describe("User's career level."),
  targetRole: z.string().optional().describe("The specific job role the user is applying for (e.g., 'Senior Product Manager', 'Registered Nurse')."),
  existingResumeSummary: z.string().optional().describe("A brief summary from an existing resume, if available, to provide context."),
  userName: z.string().optional().describe("User's name, for personalization if desired."),
  count: z.number().optional().default(15).describe("Number of questions to generate."),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

export const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(z.string().describe("A generated interview question tailored to elicit resume-enhancing information.")).describe("A list of personalized questions."),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const interviewPrompt = ai.definePrompt({
  name: 'generatePersonalizedInterviewQuestionsPrompt',
  input: { schema: GenerateInterviewQuestionsInputSchema },
  output: { schema: GenerateInterviewQuestionsOutputSchema },
  prompt: `You are an expert career coach and resume writer AI. Your goal is to generate a set of insightful and personalized questions for a user, {{userName}}, to help them provide information that will significantly enhance their resume.
The resume is for the target role of "{{targetRole}}" {{#if domain}}in the {{domain}} domain{{/if}}. The user's experience level is "{{experienceLevel}}".
{{#if existingResumeSummary}}
Their current resume summary is: "{{existingResumeSummary}}"
{{/if}}

Generate exactly {{count}} questions. The questions should be open-ended and designed to uncover:
1.  Specific achievements and quantifiable results (e.g., "Can you describe a project where you exceeded expectations and what the measurable impact was?").
2.  Key skills and how they were applied in practical situations.
3.  Problem-solving abilities and challenges overcome.
4.  Unique strengths or experiences relevant to the target role and domain.
5.  Career aspirations and motivations, if they help frame past experiences.
6.  Teamwork, leadership, or collaborative experiences.

Tailor the questions based on the provided domain, experience level, and target role.
Avoid generic questions. Make them specific enough to elicit detailed, actionable responses for resume building.
For example:
- If "Mid-Level" and "Software Engineer": "Tell me about a complex technical challenge you faced in a recent project and how you approached debugging and resolving it."
- If "Beginner" and "Marketing": "What marketing campaign (even a conceptual one or from a class project) are you most proud of, and what specific skills did you use or develop?"
- If "Executive" and "Healthcare": "Describe a strategic initiative you led that significantly improved patient outcomes or operational efficiency in a healthcare setting. What was your specific role and the key metrics of success?"

Output the questions as a JSON object with a single key "questions", which is an array of strings.
Focus on questions that will help the user articulate their value proposition effectively on their resume.
`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await interviewPrompt(input);
    if (!output || !output.questions || output.questions.length === 0) {
      // Fallback if LLM fails to generate questions
      console.warn("LLM failed to generate interview questions, using fallback.");
      return { questions: [
          "What is a project or accomplishment you are most proud of and why?",
          "Describe a significant challenge you faced at work and how you overcame it. What was the outcome?",
          "What are your top 3-5 skills that are most relevant to the role you're applying for? Provide an example of how you've used each.",
          "Can you quantify any of your achievements? (e.g., increased sales by X%, reduced costs by Y%, improved efficiency by Z%)",
          "What kind of work environment or company culture do you thrive in and why?",
          "What are your short-term career goals (next 1-2 years)?",
          "What are your long-term career goals (next 3-5 years)?",
          "Describe a time you had to learn a new skill or technology quickly. How did you approach it?",
          "Tell me about a time you worked effectively as part of a team.",
          "What makes you unique or stand out from other candidates for this type of role?",
          "What aspects of the [targetRole] role are you most excited about?",
          "How do you stay updated with trends in the [domain] industry?",
          "Describe a situation where you took initiative or demonstrated leadership.",
          "What are your key strengths you would bring to this role?",
          "Is there anything else you'd like to highlight about your experience or skills that we haven't covered?"
        ].slice(0, input.count || 15)
      };
    }
    return output;
  }
);