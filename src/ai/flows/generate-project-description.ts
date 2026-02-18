'use server';
/**
 * @fileOverview A Genkit flow for generating detailed project descriptions from brief ideas.
 *
 * - generateProjectDescription - A function that handles the project description generation process.
 * - ProjectIdeaInput - The input type for the generateProjectDescription function.
 * - ProjectDescriptionOutput - The return type for the generateProjectDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectIdeaInputSchema = z.object({
  projectIdea: z.string().describe('A brief idea or keywords for the project.'),
});
export type ProjectIdeaInput = z.infer<typeof ProjectIdeaInputSchema>;

const ProjectDescriptionOutputSchema = z.object({
  description: z.string().describe('A detailed project description.'),
});
export type ProjectDescriptionOutput = z.infer<typeof ProjectDescriptionOutputSchema>;

/**
 * Server Action to generate a detailed project description.
 */
export async function generateProjectDescription(
  input: ProjectIdeaInput
): Promise<ProjectDescriptionOutput> {
  return generateProjectDescriptionFlow(input);
}

const projectDescriptionPrompt = ai.definePrompt({
  name: 'projectDescriptionPrompt',
  input: { schema: ProjectIdeaInputSchema },
  output: { schema: ProjectDescriptionOutputSchema },
  prompt: `You are an expert project manager assistant. Your task is to expand a brief project idea or keywords into a detailed project description. 
The description should cover the project's purpose, key objectives, target audience, and expected outcomes. 
Ensure the description is professional, comprehensive, and suitable for initial project scoping.

Project Idea: {{{projectIdea}}}`,
});

const generateProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProjectDescriptionFlow',
    inputSchema: ProjectIdeaInputSchema,
    outputSchema: ProjectDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await projectDescriptionPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a project description.');
    }
    return output;
  }
);
