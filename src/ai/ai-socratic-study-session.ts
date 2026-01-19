// src/ai/ai-socratic-study-session.ts
'use server';

/**
 * @fileOverview Implements a Genkit flow for AI-powered study sessions using Socratic questioning and adaptive difficulty.
 *
 * - `startStudySession` -  Initiates and manages the study session flow.
 * - `StudySessionInput` - Defines the input schema for the study session, including the subject and optional previous context.
 * - `StudySessionOutput` - Defines the output schema for the study session, including the AI tutor's response and the updated context.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudySessionInputSchema = z.object({
  subject: z.string().describe('The subject or topic for the study session.'),
  query: z.string().describe('The user query about the subject'),
  previousContext: z.string().optional().describe('The context from the previous turn.'),
});
export type StudySessionInput = z.infer<typeof StudySessionInputSchema>;

const StudySessionOutputSchema = z.object({
  response: z.string().describe('The AI tutor\'s response, using Socratic questioning and adaptive difficulty.'),
  updatedContext: z.string().describe('The updated context for the next turn in the study session.'),
});
export type StudySessionOutput = z.infer<typeof StudySessionOutputSchema>;

export async function startStudySession(input: StudySessionInput): Promise<StudySessionOutput> {
  return studySessionFlow(input);
}

const studySessionPrompt = ai.definePrompt({
  name: 'studySessionPrompt',
  input: {schema: StudySessionInputSchema},
  output: {schema: StudySessionOutputSchema},
  prompt: `You are an expert AI tutor specializing in personalized learning using the Socratic method.

  Your goal is to guide the student to a deeper understanding of the subject matter through questioning, rather than simply providing answers.
  Adapt the difficulty of your questions based on the student's responses.
  If the student demonstrates a strong understanding, introduce more complex concepts or questions.
  If the student struggles, provide hints or simplify the questions.
  Maintain a consistent persona and adapt your communication style to the student's needs.

  Subject: {{{subject}}}
  Previous Context: {{{previousContext}}}
  Student Query: {{{query}}}

  Respond with a question or explanation to further the student's understanding.
  Also, create a new context that can be used for the next turn.
  The response and updatedContext should be geared towards helping the student learn.

  {{#if previousContext}}
  Continue the study session from the previous context.
  {{else}}
  Start a new study session.
  {{/if}}
  `, 
});

const studySessionFlow = ai.defineFlow(
  {
    name: 'studySessionFlow',
    inputSchema: StudySessionInputSchema,
    outputSchema: StudySessionOutputSchema,
  },
  async input => {
    const {output} = await studySessionPrompt(input);
    return output!;
  }
);
