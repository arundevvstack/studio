'use server';
/**
 * @fileOverview A Genkit flow for suggesting initial tasks for a project based on its description.
 *
 * - suggestProjectTasks - A function that handles the task suggestion process.
 * - SuggestProjectTasksInput - The input type for the suggestProjectTasks function.
 * - SuggestProjectTasksOutput - The return type for the suggestProjectTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProjectTasksInputSchema = z.object({
  projectDescription: z.string().describe('A detailed description of the project.'),
});
export type SuggestProjectTasksInput = z.infer<typeof SuggestProjectTasksInputSchema>;

const SuggestProjectTasksOutputSchema = z.object({
  tasks: z
    .array(
      z.object({
        name: z.string().describe('The name of the suggested task.'),
        description: z.string().describe('A brief description of the suggested task.'),
      })
    )
    .describe('A list of suggested initial tasks for the project.'),
});
export type SuggestProjectTasksOutput = z.infer<typeof SuggestProjectTasksOutputSchema>;

export async function suggestProjectTasks(input: SuggestProjectTasksInput): Promise<SuggestProjectTasksOutput> {
  return suggestProjectTasksFlow(input);
}

const suggestProjectTasksPrompt = ai.definePrompt({
  name: 'suggestProjectTasksPrompt',
  input: {schema: SuggestProjectTasksInputSchema},
  output: {schema: SuggestProjectTasksOutputSchema},
  prompt: `You are an expert project manager. Based on the following project description, generate a list of 5-10 initial tasks that would be essential for starting and planning this project.

Project Description: {{{projectDescription}}}

Ensure each task has a name and a description.`,
});

const suggestProjectTasksFlow = ai.defineFlow(
  {
    name: 'suggestProjectTasksFlow',
    inputSchema: SuggestProjectTasksInputSchema,
    outputSchema: SuggestProjectTasksOutputSchema,
  },
  async input => {
    const {output} = await suggestProjectTasksPrompt(input);
    return output!;
  }
);
