'use server';

import { studyBuddy } from '@/ai/flows/study-buddy';

// Type for chat messages, matching the client-side definition
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function generateResponse(
  history: Message[]
): Promise<{ response?: string; error?: string; isAuthError?: boolean }> {
  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
    return {
      error:
        'The Gemini API key is not configured on the backend. Please set the GOOGLE_API_KEY environment variable in the .env file.',
      isAuthError: true,
    };
  }

  try {
    const response = await studyBuddy(history);
    return { response };
  } catch (e: any) {
    console.error('[AI_ERROR]', e);
    let userMessage = 'An unexpected error occurred while talking to the AI.';
    let isAuthError = false;

    // Crude error inspection for Gemini API errors wrapped by Genkit
    const errorString = e.toString();
    if (
      errorString.includes('400') ||
      errorString.includes('API key not valid')
    ) {
      userMessage =
        'The backend Gemini API key is invalid or expired. Please check the environment configuration.';
      isAuthError = true;
    } else if (
      errorString.includes('429') ||
      errorString.includes('ResourceExhausted')
    ) {
      userMessage =
        'The application is sending requests too quickly. Please wait a moment and try again.';
      isAuthError = false;
    }

    return { error: userMessage, isAuthError };
  }
}
