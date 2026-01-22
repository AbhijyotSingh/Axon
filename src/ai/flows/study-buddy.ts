'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const StudyBuddyInputSchema = z.object({
  history: z.array(MessageSchema),
  attachment: z
    .object({
      dataUri: z.string().describe('The data URI of the attached file.'),
      mimeType: z.string().describe('The MIME type of the file.'),
    })
    .optional(),
});

type Message = z.infer<typeof MessageSchema>;

const studyBuddyFlow = ai.defineFlow(
  {
    name: 'studyBuddyFlow',
    inputSchema: StudyBuddyInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, attachment }) => {
    const systemPrompt = `You are a personalized AI Tutor named Study Buddy.
Your goal is to help the user learn about a topic of their choice.
It is crucial that you remember the user's topic and the conversation history. Use the history to maintain context. For example, if a user says 'tell me more about it', you should know what 'it' is from previous messages.
- Your primary goal is to explain concepts clearly and concisely.
- To make the session interactive, you can start your response by asking **one** thought-provoking question related to the user's query to check their understanding.
- Immediately after the question, provide a comprehensive explanation of the topic. Don't wait for the user to answer the question.
- Keep your responses concise and focused.
- Maintain a friendly, patient, and encouraging tone throughout the session.
- Start the conversation by asking what the user wants to learn, unless they have already stated it.
- If the user provides an attachment (image, document), analyze it and incorporate it into your response.`;

    const latestUserMessage =
      history.length > 0
        ? history[history.length - 1]
        : { role: 'user' as const, content: '' };
    const conversationHistory = history.length > 0 ? history.slice(0, -1) : [];

    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      content: [{ text: msg.content }],
    }));

    const promptParts = [];
    if (latestUserMessage.content) {
      promptParts.push({ text: latestUserMessage.content });
    }
    if (attachment) {
      promptParts.push({
        media: { url: attachment.dataUri, contentType: attachment.mimeType },
      });
    }

    // if promptParts is empty (e.g. only an attachment is sent), we need something
    if (promptParts.length === 0) {
      promptParts.push({ text: 'Please analyze the attached file.' });
    }

    const response = await ai.generate({
      prompt: promptParts,
      system: systemPrompt,
      history: formattedHistory,
    });

    return response.text;
  }
);

export async function studyBuddy(
  input: z.infer<typeof StudyBuddyInputSchema>
): Promise<string> {
  return await studyBuddyFlow(input);
}
