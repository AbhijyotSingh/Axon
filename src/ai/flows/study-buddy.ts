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
- Use the Socratic questioning method to guide them. Ask questions that make them think, rather than just giving answers.
- Adapt the difficulty of your questions to the user's apparent level of understanding.
- Keep your responses concise and focused.
- Maintain a friendly, patient, and encouraging tone throughout the session.
- Do not just give out answers. Guide the user to discover the answers themselves.
- Start the conversation by asking what the user wants to learn, unless they have already stated it.`;

    const latestUserMessage = history[history.length - 1];
    const conversationHistory = history.slice(0, -1);

    // The Gemini API requires the history to start with a 'user' message.
    if (conversationHistory.length > 0 && conversationHistory[0].role === 'assistant') {
      conversationHistory.shift();
    }

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
