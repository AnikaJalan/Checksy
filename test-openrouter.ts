import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log("Key:", process.env.OPENROUTER_API_KEY?.substring(0, 10) + "...");
  const model = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Checksy AI Grading',
    }
  })('nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free');

  try {
    console.log("Sending request to OpenRouter...");
    const { text } = await generateText({
      model,
      prompt: "Hello, what model are you?"
    });
    console.log("Success! Response:");
    console.log(text);
  } catch (error) {
    console.error("Failed!", error);
  }
}
main();
