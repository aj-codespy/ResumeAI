import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
// import {openai} from '@genkit-ai/openai'; // Example if OpenAI plugin was to be used

// Configure Google AI plugin. API key is typically set via GOOGLE_API_KEY environment variable.
const googleAiPlugin = googleAI();

// Example: Configure OpenAI plugin if it were to be used.
// const openAiPlugin = openai({apiKey: process.env.OPENAI_API_KEY});

export const ai = genkit({
  plugins: [
    googleAiPlugin,
    // openAiPlugin, // Add other configured plugins here
  ],
  // Default model can be set here or overridden in specific flow/prompt definitions.
  // It's good practice to use an environment variable for the default model as well.
  model: process.env.DEFAULT_GENKIT_MODEL || 'googleai/gemini-2.0-flash',
  
  // The `logLevel` option is not available in Genkit v1.x at the top-level `genkit()` call.
  // Logging is configured differently, often per-plugin or through environment variables like GENKIT_LOG_LEVEL.
});
