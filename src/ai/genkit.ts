import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/google-genai';

/**
 * Genkit instance configured for the studio's AI workflows.
 * Using gemini-1.5-flash via imported constant for high-performance text and structural reasoning.
 * Explicitly passing API keys to handle various environment configurations.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  model: gemini15Flash,
});
