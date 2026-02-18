'use server';
/**
 * @fileOverview This file defines a Genkit flow to summarize a project's current status and health.
 *
 * - summarizeProjectStatus - A function that handles the project status summarization process.
 * - SummarizeProjectStatusInput - The input type for the summarizeProjectStatus function.
 * - SummarizeProjectStatusOutput - The return type for the summarizeProjectStatus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeProjectStatusInputSchema = z.object({
  description: z.string().describe('A general description of the project.'),
  tasks: z.array(z.string()).describe('A list of current tasks for the project.'),
  notes: z.array(z.string()).describe('A list of recent notes or updates regarding the project.'),
});
export type SummarizeProjectStatusInput = z.infer<typeof SummarizeProjectStatusInputSchema>;

const SummarizeProjectStatusOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the project\'s current status and health.'),
});
export type SummarizeProjectStatusOutput = z.infer<typeof SummarizeProjectStatusOutputSchema>;

export async function summarizeProjectStatus(input: SummarizeProjectStatusInput): Promise<SummarizeProjectStatusOutput> {
  return summarizeProjectStatusFlow(input);
}

const summarizeProjectStatusPrompt = ai.definePrompt({
  name: 'summarizeProjectStatusPrompt',
  input: { schema: SummarizeProjectStatusInputSchema },
  output: { schema: SummarizeProjectStatusOutputSchema },
  prompt: `You are an AI assistant specializing in project management. Your task is to provide a concise summary of a project's current status and health based on the provided information.
Focus on key achievements, current blockers, overall health, and next steps.

Project Description: {{{description}}}

Tasks:
{{#each tasks}}
- {{{this}}}
{{/each}}

Recent Notes:
{{#each notes}}
- {{{this}}}
{{/each}}

Based on the above, please provide a summary of the project's current status and health:`,
});

const summarizeProjectStatusFlow = ai.defineFlow(
  {
    name: 'summarizeProjectStatusFlow',
    inputSchema: SummarizeProjectStatusInputSchema,
    outputSchema: SummarizeProjectStatusOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeProjectStatusPrompt(input);
    return output!;
  }
);
