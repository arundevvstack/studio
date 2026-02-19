import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-project-tasks-flow.ts';
import '@/ai/flows/generate-project-description.ts';
import '@/ai/flows/summarize-project-status.ts';
import '@/ai/flows/generate-invitation-email.ts';
