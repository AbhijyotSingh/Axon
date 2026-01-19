'use server';

import { studyBuddy } from '@/ai/flows/study-buddy';

// Type for chat messages, matching the client-side definition
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function generateResponse(
  history: Message[],
  apiKey: string
): Promise<{ response?: string; error?: string; isAuthError?: boolean }> {
  if (!apiKey) {
    return {
      error: 'API key not found. Please enter your key to begin.',
      isAuthError: true,
    };
  }

  // Temporarily set the API key as an environment variable for Genkit to use.
  // This is a workaround due to Genkit's configuration model and the per-user key requirement.
  const originalApiKey = process.env.GOOGLE_API_KEY;
  process.env.GOOGLE_API_KEY = apiKey;

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
        'Your Gemini API key is invalid or expired. Please enter a valid key.';
      isAuthError = true;
    } else if (
      errorString.includes('429') ||
      errorString.includes('ResourceExhausted')
    ) {
      userMessage =
        'You are sending requests too quickly. Please wait a moment and try again.';
      isAuthError = false;
    }

    return { error: userMessage, isAuthError };
  } finally {
    // Restore the original environment variable state
    process.env.GOOGLE_API_KEY = originalApiKey;
  }
}
