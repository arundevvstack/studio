import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit instance configured for the studio's AI workflows.
 * Using gemini-1.5-flash via string identifier for high-performance text and structural reasoning.
 * The googleAI plugin automatically looks for GOOGLE_GENAI_API_KEY, but we provide explicit fallbacks.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
