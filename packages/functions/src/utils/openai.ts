import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";

interface SecretParam {
  name: string;
  value(): string;
}

export const openAIApiKey: SecretParam = defineSecret("OPENAI_API_KEY");

let client: OpenAI;

const OPENAI_MAX_RETRIES = 2;
const OPENAI_TIMEOUT = 20000; // 20 seconds
const CHATGPT_MODEL: OpenAI.ChatModel = "gpt-4o-mini";
const CHATGPT_TEMPERATURE: number = 0.1; // 0 - 2
const CHATGPT_TOP_P: number = 0.1; // 0 - 1
const CHATGPT_FREQUENCY_PENALTY: number = 0; // 0 - 2
const CHATGPT_PRESENCE_PENALTY: number = 0; // 0 - 2
const CHATGPT_MAX_COMPLETION_TOKENS: number = 512;
const CHATGPT_N = 1;

export function getOpenAIClient() {
  if (client) {
    return client;
  }

  const apiKey = openAIApiKey.value() || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return (client = new OpenAI({
    apiKey,
    maxRetries: OPENAI_MAX_RETRIES,
    timeout: OPENAI_TIMEOUT,
  }));
}

export function getDefaultCompletionsParams() {
  return {
    model: CHATGPT_MODEL,
    temperature: CHATGPT_TEMPERATURE,
    top_p: CHATGPT_TOP_P,
    frequency_penalty: CHATGPT_FREQUENCY_PENALTY,
    presence_penalty: CHATGPT_PRESENCE_PENALTY,
    max_completion_tokens: CHATGPT_MAX_COMPLETION_TOKENS,
    n: CHATGPT_N,
  };
}
