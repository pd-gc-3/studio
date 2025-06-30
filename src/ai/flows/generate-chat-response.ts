'use server';
/**
 * @fileOverview Generates a chat response based on conversation history.
 *
 * - generateChatResponse - A function that generates a chat response.
 * - GenerateChatResponseInput - The input type for the generateChatResponse function.
 * - GenerateChatResponseOutput - The return type for the generateChatResponse function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateChatResponseInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).describe("The conversation history."),
});
export type GenerateChatResponseInput = z.infer<typeof GenerateChatResponseInputSchema>;

const GenerateChatResponseOutputSchema = z.object({
  response: z.string().describe('The generated chat response.'),
});
export type GenerateChatResponseOutput = z.infer<typeof GenerateChatResponseOutputSchema>;

export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  const llmResponse = await ai.generate({
    model: 'googleai/gemini-2.5-flash-preview',
    system: "You are EchoFlow, an intelligent and helpful AI assistant. Your responses should be accurate, relevant, and concise.",
    messages: input.history.map((message) => ({
        content: [{ text: message.content }],
        // Genkit uses 'model' for assistant role
        role: message.role === 'assistant' ? 'model' : message.role,
    })),
    config: {
        temperature: 0.5,
    }
  });

  return { response: llmResponse.text };
}
