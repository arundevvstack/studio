'use server';
/**
 * @fileOverview A Genkit flow for generating professional team invitation emails.
 *
 * - generateInvitationEmail - A function that handles the email synthesis process.
 * - InvitationEmailInput - The input type for the function.
 * - InvitationEmailOutput - The return type containing the subject and body.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InvitationEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the invitee.'),
  role: z.string().describe('The strategic role assigned to the invitee.'),
  inviteLink: z.string().url().describe('The secure acceptance link.'),
  adminName: z.string().optional().describe('The name of the administrator sending the invite.'),
});
export type InvitationEmailInput = z.infer<typeof InvitationEmailInputSchema>;

const InvitationEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line for the invitation email.'),
  body: z.string().describe('The full body text of the invitation email.'),
});
export type InvitationEmailOutput = z.infer<typeof InvitationEmailOutputSchema>;

/**
 * Server Action to generate a professional invitation email.
 */
export async function generateInvitationEmail(
  input: InvitationEmailInput
): Promise<InvitationEmailOutput> {
  return generateInvitationEmailFlow(input);
}

const invitationEmailPrompt = ai.definePrompt({
  name: 'invitationEmailPrompt',
  input: { schema: InvitationEmailInputSchema },
  output: { schema: InvitationEmailOutputSchema },
  prompt: `You are an executive assistant at Marzelz Lifestyle, a premium media production studio.
Your task is to write a high-end, professional invitation email to a new team member.

Invitee Email: {{{email}}}
Assigned Strategic Role: {{{role}}}
Acceptance Link: {{{inviteLink}}}
{{#if adminName}}Sent by: {{{adminName}}}{{/if}}

The tone should be sophisticated, welcoming, and highlight the studio's focus on high-performance creative production. 
Ensure the "Acceptance Link" is clearly presented as the primary action item.`,
});

const generateInvitationEmailFlow = ai.defineFlow(
  {
    name: 'generateInvitationEmailFlow',
    inputSchema: InvitationEmailInputSchema,
    outputSchema: InvitationEmailOutputSchema,
  },
  async (input) => {
    const { output } = await invitationEmailPrompt(input);
    if (!output) {
      throw new Error('AI failed to synthesize the invitation email.');
    }
    return output;
  }
);
