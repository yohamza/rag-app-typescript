import { OpenAI } from 'openai';
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * This function gets the AI completion from the OpenAI API.
 */
async function getAICompletion(prompt: string) {
    const completionResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
      temperature: 0.2,
    })
    return completionResponse;
}

export { getAICompletion };