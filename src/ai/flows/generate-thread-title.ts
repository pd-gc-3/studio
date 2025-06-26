// src/ai/flows/generate-thread-title.ts
'use server';

/**
 * @fileOverview Generates a thread title based on the first message in a chat thread.
 *
 * - generateThreadTitle - A function that generates the thread title.
 * - GenerateThreadTitleInput - The input type for the generateThreadTitle function.
 * - GenerateThreadTitleOutput - The return type for the generateThreadTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThreadTitleInputSchema = z.object({
  firstMessage: z
    .string()
    .describe('The first message in the chat thread.'),
});

export type GenerateThreadTitleInput = z.infer<typeof GenerateThreadTitleInputSchema>;

const GenerateThreadTitleOutputSchema = z.object({
  threadTitle: z.string().describe('The generated title for the chat thread.'),
});

export type GenerateThreadTitleOutput = z.infer<typeof GenerateThreadTitleOutputSchema>;

export async function generateThreadTitle(input: GenerateThreadTitleInput): Promise<GenerateThreadTitleOutput> {
  return generateThreadTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThreadTitlePrompt',
  input: {schema: GenerateThreadTitleInputSchema},
  output: {schema: GenerateThreadTitleOutputSchema},
  prompt: `You are an expert at creating concise and relevant titles for chat threads.

  Generate a title that accurately reflects the content of the first message in the thread.

  First Message: {{{firstMessage}}}

  Title: `,
  model: 'groq/llama-3-3-70b-8192',
});

const generateThreadTitleFlow = ai.defineFlow(
  {
    name: 'generateThreadTitleFlow',
    inputSchema: GenerateThreadTitleInputSchema,
    outputSchema: GenerateThreadTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
