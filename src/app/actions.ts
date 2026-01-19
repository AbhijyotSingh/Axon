'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { studyBuddy } from '@/ai/flows/study-buddy';

const API_KEY_FILE_PATH = path.join(process.cwd(), '.gemini_api_key');

const ApiKeySchema = z.string().min(10, 'API key seems too short.');

// Type for chat messages, matching the client-side definition
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function checkApiKey(): Promise<boolean> {
  try {
    await fs.access(API_KEY_FILE_PATH);
    return true;
  } catch {
    return false;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    const key = await fs.readFile(API_KEY_FILE_PATH, 'utf-8');
    return key.trim();
  } catch {
    return null;
  }
}

export async function saveApiKey(
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  const validation = ApiKeySchema.safeParse(apiKey);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    await fs.writeFile(API_KEY_FILE_PATH, validation.data, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save API key:', error);
    return { success: false, error: 'Could not save the API key on the server.' };
  }
}

export async function deleteApiKey(): Promise<void> {
    try {
        await fs.unlink(API_KEY_FILE_PATH);
    } catch (error) {
        // Ignore errors if the file doesn't exist
        if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
            console.error('Failed to delete API key:', error);
        }
    }
}

export async function generateResponse(
  history: Message[]
): Promise<{ response?: string; error?: string; isAuthError?: boolean }> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return { error: 'API key not found. Please enter your key to begin.', isAuthError: true };
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
    if (errorString.includes('400') || errorString.includes('API key not valid')) {
        userMessage = 'Your Gemini API key is invalid or expired. Please enter a valid key.';
        isAuthError = true;
    } else if (errorString.includes('429') || errorString.includes('ResourceExhausted')) {
        userMessage = 'You have exceeded your API quota. Please check your Gemini account or try again later.';
        isAuthError = true;
    }

    return { error: userMessage, isAuthError };
  } finally {
    // Restore the original environment variable state
    process.env.GOOGLE_API_KEY = originalApiKey;
  }
}
