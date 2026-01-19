# **App Name**: AI Study Buddy - Your personal trainer

## Core Features:

- Initial API Key Request: On initial app load, the chatbot prompts the user to enter their Gemini API key with the precise message: 'Please enter your Gemini API key to continue learning.'
- API Key Storage: The application stores the provided API key to a file on the backend.
- Post-API Key Prompt: Immediately after successfully storing the API key, the chatbot asks: 'What do you want to learn?'
- Study Session: Engage in study sessions, responding to user queries using the Gemini model and leveraging Socratic questioning and adaptive difficulty. Memory of prior questions must persist throughout the study session. Gemini will act as a personalized AI Tutor.
- Error Handling: Implement robust error handling for cases where Gemini throws ResourceExhausted, TooManyRequests, or invalid/expired API key errors. Show user-friendly messages guiding the user to re-enter a valid Gemini API key when those errors occur.
- Chat UI: A visually distinct chat UI with message bubbles to separate user and bot messages and must work when hitting the Enter Key or using a dedicated button
- Backend Communication: Establish Nextjs (app router) and backend to communicate using a provided Gemini API Key

## Style Guidelines:

- Primary color: Dark indigo (#4B0082), inspired by the depth of knowledge and learning.
- Background color: Very light lavender (#F0F8FF), for a calming and unobtrusive backdrop.
- Accent color: Vibrant gold (#FFD700), symbolizing enlightenment and achievement in learning.
- Headline font: 'Playfair', a modern sans-serif with a high-end feel; body text: 'PT Sans', a humanist sans-serif, which combines a modern look with warmth and readability.
- Simple, clear icons to represent different study subjects or functionalities.
- Clean and intuitive chat interface layout, with clear separation between user and bot messages.
- Subtle animations for loading states and message delivery to enhance user experience.