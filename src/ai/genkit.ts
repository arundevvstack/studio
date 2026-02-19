import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit instance configured for high-performance creative synthesis.
 * 
 * IMPORTANT: This instance requires a valid Google AI API Key.
 * Priority order: GOOGLE_GENAI_API_KEY -> GEMINI_API_KEY -> GOOGLE_API_KEY
 */
const apiKey = (
  process.env.GOOGLE_GENAI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_API_KEY || 
  ''
).trim();

export const ai = genkit({
  plugins: [
    googleAI({ apiKey }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
