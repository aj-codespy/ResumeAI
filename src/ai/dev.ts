import { config } from 'dotenv';
config();

import '@/ai/flows/ai-bullet-point-enhancer.ts';
import '@/ai/flows/ai-resume-generation.ts';
import '@/ai/flows/resume-revamping.ts';
import '@/ai/flows/grammar-tone-correction.ts';
import '@/ai/flows/ats-optimization.ts';
import '@/ai/flows/ai-summary-generator.ts';
import '@/ai/flows/resume-parser.ts'; // New
import '@/ai/flows/interview-question-generator.ts'; // New

// Tools are typically not directly "started" like flows in dev.ts, 
// but ensuring they are imported where used (like in flow files) is sufficient.
// We can add an import here to ensure it's part of the build if there are any direct registrations needed,
// but Genkit tools are usually self-registering when defined with ai.defineTool and imported by flows.
// For clarity and to ensure it's processed by tsx during genkit:dev:
import '@/ai/tools/ats-keyword-retriever.ts'; 
