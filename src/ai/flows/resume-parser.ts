// src/ai/flows/resume-parser.ts
'use server';
/**
 * @fileOverview A Genkit flow to parse resume files (PDF, DOCX, TXT) into structured JSON.
 * It first extracts raw text from the file, then uses an LLM to structure this text.
 *
 * - parseResume - The main function to parse a resume.
 * - ParseResumeInput - Input type for the parseResume function.
 * - ParseResumeOutput - Output type for the parseResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as pdfParse from 'pdf-parse'; // pdf-parse is a CommonJS module
import mammoth from 'mammoth';
import { ParsedResumeDataSchema } from '@/lib/schemas'; // Use the shared schema

export const ParseResumeInputSchema = z.object({
  resumeDataUri: z.string().describe("Data URI of the resume file. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  fileType: z.enum(['pdf', 'docx', 'txt']).describe("The type of the resume file."),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

// Output schema is now imported from lib/schemas
export type ParseResumeOutput = z.infer<typeof ParsedResumeDataSchema>;

async function extractTextFromDataUri(dataUri: string, fileType: 'pdf' | 'docx' | 'txt'): Promise<string> {
  const base64Data = dataUri.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid data URI format.');
  }
  const buffer = Buffer.from(base64Data, 'base64');

  switch (fileType) {
    case 'pdf':
      const data = await pdfParse.default(buffer); // pdf-parse uses .default for CJS
      return data.text;
    case 'docx':
      const { value } = await mammoth.extractRawText({ buffer });
      return value;
    case 'txt':
      return buffer.toString('utf-8');
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export async function parseResume(input: ParseResumeInput): Promise<ParseResumeOutput> {
  return parseResumeFlow(input);
}

const structuringPrompt = ai.definePrompt({
  name: 'structureResumeTextPrompt',
  input: { schema: z.object({ rawText: z.string(), fileName: z.string().optional() }) },
  output: { schema: ParsedResumeDataSchema },
  prompt: `You are an expert resume parsing AI. You will be given raw text extracted from a resume document.
Your task is to analyze this text and structure it into a JSON object adhering to the provided schema.
Extract key information such as name, contact details, summary, skills, work experience, education, projects, and certifications.
Prioritize accuracy and completeness. If some information is not present, omit the corresponding fields rather than guessing.
For 'experience', 'education', and 'projects', try to identify individual entries and structure them as an array of objects.
For skills and certifications, list them as an array of strings.
Pay attention to dates, roles, company names, institutions, and degrees.
The raw text might have OCR errors or unusual formatting; do your best to interpret it correctly.

Raw text from file {{fileName}}:
\`\`\`
{{{rawText}}}
\`\`\`

Please provide the structured JSON output.`,
});

const parseResumeFlow = ai.defineFlow(
  {
    name: 'parseResumeFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParsedResumeDataSchema,
  },
  async (input) => {
    let rawText = '';
    try {
      rawText = await extractTextFromDataUri(input.resumeDataUri, input.fileType);
    } catch (error) {
      console.error('Error extracting text:', error);
      // Fallback: return raw text with an error message or handle as needed
      return { rawText: `Error extracting text: ${error instanceof Error ? error.message : String(error)}` };
    }

    if (!rawText.trim()) {
      return { rawText: '' }; // Return empty rawText if extraction yielded nothing
    }
    
    const fileName = input.resumeDataUri.substring(5, input.resumeDataUri.indexOf(';')) || 'uploaded file';


    const { output } = await structuringPrompt({ rawText, fileName });
    if (!output) {
      throw new Error('Failed to structure resume text using LLM.');
    }
    
    // Ensure rawText is part of the final output, even if LLM doesn't explicitly include it
    return { ...output, rawText };
  }
);