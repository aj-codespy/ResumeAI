
'use server';
/**
 * @fileOverview AI-powered resume generation flow.
 *
 * - generateTailoredResume - A function that generates a tailored resume based on user inputs.
 * - GenerateTailoredResumeInput - The input type for the generateTailoredResume function.
 * - GenerateTailoredResumeOutput - The return type for the generateTailoredResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { atsKeywordRetrieverTool } from '@/ai/tools/ats-keyword-retriever';

const GenerateTailoredResumeInputSchema = z.object({
  name: z.string().describe('The full name of the user.'),
  contactInfo: z.string().describe('The contact information of the user (e.g., email, phone number, LinkedIn profile URL from contact form).'),
  targetJobTitle: z.string().describe('The target job title for the resume.'),
  yearsOfExperience: z.number().describe('The number of years of experience the user has.'),
  careerLevel: z.enum(['Beginner', 'Mid-Level', 'Executive', 'Student/Intern']).describe('The career level of the user.'),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    graduationDate: z.string(),
  })).describe('The education history of the user.'),
  workExperience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    dates: z.string(),
    responsibilities: z.string().describe('Detailed responsibilities and achievements for this role.'),
  })).describe('The work experience history of the user.'),
  skills: z.array(z.string()).describe('A list of skills the user possesses.'),
  projects: z.array(z.string()).optional().describe('Descriptions of projects the user has worked on.'),
  certifications: z.array(z.string()).optional().describe('A list of certifications the user holds.'),
  jobDescription: z.string().optional().describe('The full job description for the target role, to tailor the resume against.'),
  emphasisSkills: z.array(z.string()).optional().describe('Specific skills the user wants to emphasize.'),
  linkedinProfileUrl: z.string().url().optional().or(z.literal('')).describe("User's LinkedIn profile URL for additional context."),
  interviewAnswers: z.array(z.object({ question: z.string(), answer: z.string() })).optional().describe("Answers to a personalized questionnaire to gather deeper insights for the resume."),
  selectedModel: z.string().optional().describe("Optional: Specify a Genkit model name (e.g., 'googleai/gemini-pro'). Defaults to 'googleai/gemini-2.0-flash' or GENKIT_DEFAULT_MODEL.")
});
export type GenerateTailoredResumeInput = z.infer<typeof GenerateTailoredResumeInputSchema>;

const GenerateTailoredResumeOutputSchema = z.object({
  resumeMarkdown: z.string().describe('The generated resume in Markdown format, optimized for ATS and professional presentation.'),
});
export type GenerateTailoredResumeOutput = z.infer<typeof GenerateTailoredResumeOutputSchema>;

export async function generateTailoredResume(input: GenerateTailoredResumeInput): Promise<GenerateTailoredResumeOutput> {
  return generateTailoredResumeFlow(input);
}

const resumePrompt = ai.definePrompt({
  name: 'generateTailoredResumePrompt',
  input: { schema: GenerateTailoredResumeInputSchema },
  output: { schema: GenerateTailoredResumeOutputSchema },
  tools: [atsKeywordRetrieverTool],
  // Model can be dynamically set here or use the Genkit default
  // model: input.selectedModel || process.env.RESUME_GENERATION_MODEL || 'googleai/gemini-2.0-flash', // Example of dynamic model selection
  prompt: `You are an expert AI Resume Writer specializing in crafting highly optimized, professional resumes that are ATS-compliant and tailored for specific job roles.
Your goal is to generate a resume in well-structured MARKDOWN format. Use standard, ATS-friendly fonts implicitly (e.g., Helvetica, Arial, Calibri) by using clean Markdown.

User Profile:
- Name: {{{name}}}
- Contact: {{{contactInfo}}}
- Target Job Title: {{{targetJobTitle}}}
- Career Level: {{{careerLevel}}}
- Years of Experience: {{{yearsOfExperience}}}
{{#if linkedinProfileUrl}}- LinkedIn: {{{linkedinProfileUrl}}}{{/if}}

Core Information:
- Education:
{{#each education}}  - Institution: {{{institution}}}, Degree: {{{degree}}}, Graduation: {{{graduationDate}}}
{{/each}}
- Work Experience:
{{#each workExperience}}  - Company: {{{company}}}, Role: {{{role}}} ({{{dates}}})
    Responsibilities/Achievements: {{{responsibilities}}}
{{/each}}
- Skills: {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None provided{{/if}}
{{#if emphasisSkills}}- Skills to Emphasize: {{#each emphasisSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if projects}}- Projects:
{{#each projects}}  - {{{this}}}
{{/each}}{{/if}}
{{#if certifications}}- Certifications:
{{#each certifications}}  - {{{this}}}
{{/each}}{{/if}}

{{#if jobDescription}}
Target Job Description Analysis:
- The resume MUST be tailored to the following job description. Analyze it for key requirements and keywords.
  \`\`\`
  {{{jobDescription}}}
  \`\`\`
  - Use the 'atsKeywordRetrieverTool' with keywords from this job description to get further ATS keyword suggestions to incorporate.
{{else}}
- No specific job description provided. Focus on a strong general resume for the "{{targetJobTitle}}" role and "{{careerLevel}}" level. Use the 'atsKeywordRetrieverTool' with the job title to get relevant ATS keyword suggestions.
{{/if}}

{{#if interviewAnswers}}
Deeper Insights from User Interview:
{{#each interviewAnswers}}  - Q: {{{question}}}
    A: {{{answer}}}
{{/each}}
- Use these answers to add depth, personality, and specific examples/achievements to the resume sections, especially the summary and experience descriptions.
{{/if}}

Instructions for Resume Generation & Structure:
1.  **Format**: Generate the resume in clean, well-structured MARKDOWN. Use headings (#, ##, ###), bullet points (- or *), and bolding (**) appropriately for readability and ATS compatibility.
2.  **ATS Optimization**:
    *   Incorporate relevant keywords naturally throughout the resume. Refer to the job description (if provided) and use the 'atsKeywordRetrieverTool' for keyword suggestions.
    *   Ensure clear section headings (e.g., "Summary", "Work Experience", "Education", "Skills", "Projects").
    *   Use action verbs to start bullet points in experience sections (e.g., "Led", "Developed", "Managed").
3.  **Content Sections & Order (Adapt based on Career Level)**:
    *   **Summary/Objective**: Craft a compelling professional summary (or objective for Student/Intern/Beginner levels) tailored to the target role, highlighting key strengths, experience, and career goals reflected in the inputs. Integrate insights from interview answers.
    {{#if (eq careerLevel "Student/Intern")}}
    *   **Education**: (Prioritize for Student/Intern) Present clearly and concisely. Include relevant coursework or academic projects if applicable.
    *   **Projects**: (Prioritize for Student/Intern, if any) Detail personal, academic, or volunteer projects.
    *   **Work Experience / Internships**: (If any) Focus on transferable skills and achievements.
    {{else if (eq careerLevel "Beginner")}}
    *   **Work Experience**: (If substantial, otherwise Education might come first if work experience is limited)
    *   **Education**:
    *   **Projects**: (If relevant and impactful)
    {{else}}
    *   **Work Experience**: (Prioritize for Mid-Level/Executive) For each role, transform responsibilities into achievement-oriented bullet points. Quantify achievements whenever possible (e.g., "Increased sales by 15%"). Use the STAR method implicitly.
    *   **Education**:
    *   **Projects**: (If they demonstrate significant skills or leadership not covered in Work Experience)
    {{/if}}
    *   **Skills**: List skills clearly. If 'emphasisSkills' are provided, ensure they are prominently featured. Categorize if appropriate (e.g., Technical Skills, Soft Skills).
    *   **Certifications**: (If any)
4.  **Professionalism**: Maintain a professional tone. Use precise phrasing and avoid jargon where simpler terms suffice, unless the jargon is industry-standard and relevant to the JD.
5.  **Personalization**: Deeply personalize the content using all provided information, especially the interview answers, to make the resume unique and reflective of the user's specific experiences and strengths.

Output ONLY the resume in Markdown format as 'resumeMarkdown'. Do not include any other explanatory text before or after the Markdown content.
`,
});

const generateTailoredResumeFlow = ai.defineFlow(
  {
    name: 'generateTailoredResumeFlow',
    inputSchema: GenerateTailoredResumeInputSchema,
    outputSchema: GenerateTailoredResumeOutputSchema,
  },
  async (input) => {
    // Determine the model to use
    const modelToUse = input.selectedModel || process.env.GENKIT_DEFAULT_MODEL || 'googleai/gemini-2.0-flash';
    
    const { output } = await ai.generate({
        prompt: resumePrompt.prompt!, // Access the raw prompt string
        model: modelToUse, // Specify the model dynamically
        input: input, // Pass the full input to be used by Handlebars
        output: { schema: GenerateTailoredResumeOutputSchema }, // Define output schema for this specific generation call
        tools: [atsKeywordRetrieverTool],
        config: {
            // any model-specific config if needed
        }
    });

    if (!output?.resumeMarkdown) {
      throw new Error("AI failed to generate resume content.");
    }
    return { resumeMarkdown: output.resumeMarkdown };
  }
);

// Helper for Handlebars (if not already defined globally elsewhere)
if (typeof Handlebars !== 'undefined') {
  Handlebars.registerHelper('eq', function (a:any, b:any) {
    return a === b;
  });
}
