import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define your system prompt for flashcard generation
const systemPrompt = `
You are a flashcard creator. You take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  flashcards:[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}`;

// Async function to handle POST requests
export async function POST(req) {
  // Initialize the OpenAI API client with your API key
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  // Ensure your API key is stored in environment variables
  });

  // Get the text data from the request
  const data = await req.text();

  try {
    // Create a completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: data },
      ],
      model: 'gpt-4',
    });

    // Parse the JSON response from the OpenAI API
    const flashcards = JSON.parse(completion.choices[0].message.content);

    // Return the flashcards as a JSON response
    return NextResponse.json(flashcards.flashcards);

  } catch (error) {
    // Handle any errors and return an error response
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
