import OpenAI from 'openai';

const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

export const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openRouterApiKey || 'mock_key',
  dangerouslyAllowBrowser: true,
});
