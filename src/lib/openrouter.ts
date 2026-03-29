import { OpenRouter } from '@openrouter/sdk';

if (!process.env.OPENROUTER_API_KEY) {
  console.warn('Warning: OPENROUTER_API_KEY is not defined in environment variables.');
}

export const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});
