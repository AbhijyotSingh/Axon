'use server';

import { axon } from '@/ai/flows/study-buddy';

// Type for chat messages, matching the client-side definition
type HistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Attachment = {
  dataUri: string;
  type: string;
  name: string;
};

export async function generateResponse(
  history: HistoryMessage[],
  attachment?: Attachment
): Promise<{ response?: string; error?: string; isAuthError?: boolean }> {
  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE' || process.env.GOOGLE_API_KEY.includes('PASTE_YOUR')) {
    return {
      error:
        'The Gemini API key is not configured on the backend. Please contact the application administrator.',
      isAuthError: false, // This is a backend config error, not a user auth error.
    };
  }

  try {
    const response = await axon({
      history,
      attachment: attachment
        ? { dataUri: attachment.dataUri, mimeType: attachment.type }
        : undefined,
    });
    return { response };
  } catch (e: any) {
    console.error('[AI_ERROR]', e);
    let userMessage = 'An unexpected error occurred while talking to the AI.';
    let isAuthError = false;

    const errorString = e.toString();
    if (
      errorString.includes('400') ||
      errorString.includes('API key not valid')
    ) {
      userMessage =
        'The Gemini API key on the backend is invalid or expired. Please contact the application administrator.';
      isAuthError = false; // This is a backend config error, not a user auth error.
    } else if (
      errorString.includes('429') ||
      errorString.includes('ResourceExhausted')
    ) {
      userMessage =
        'The AI is receiving too many requests. Please wait a moment and try again.';
      isAuthError = false;
    }

    return { error: userMessage, isAuthError };
  }
}
