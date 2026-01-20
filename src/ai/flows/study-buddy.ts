'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

type Message = z.infer<typeof MessageSchema>;

const studyBuddyFlow = ai.defineFlow(
  {
    name: 'studyBuddyFlow',
    inputSchema: z.object({ history: z.array(MessageSchema) }),
    outputSchema: z.string(),
  },
  async ({ history }) => {
    const systemPrompt = `You are a personalized AI Tutor named Study Buddy.
Your goal is to help the user learn about a topic of their choice.
It is crucial that you remember the user's topic and the conversation history. Use the history to maintain context. For example, if a user says 'tell me more about it', you should know what 'it' is from previous messages.
- Your primary goal is to explain concepts clearly and concisely.
- To make the session interactive, you can start your response by asking **one** thought-provoking question related to the user's query to check their understanding.
- Immediately after the question, provide a comprehensive explanation of the topic. Don't wait for the user to answer the question.
- Keep your responses concise and focused.
- Maintain a friendly, patient, and encouraging tone throughout the session.
- Start the conversation by asking what the user wants to learn, unless they have already stated it.`;

    const latestUserMessage = history[history.length - 1];
    const conversationHistory = history.slice(0, -1);

    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      content: [{ text: msg.content }],
    }));

    const response = await ai.generate({
      prompt: latestUserMessage.content,
      system: systemPrompt,
      history: formattedHistory,
    });

    return response.text;
  }
);

export async function studyBuddy(history: Message[]): Promise<string> {
  return await studyBuddyFlow({ history });
}
