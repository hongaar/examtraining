import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { FirestoreCollection } from "@examtraining/core";
import { defineSecret } from "firebase-functions/params";
import OpenAI from "openai";
import { collectionRef, getDocument } from "./utils";

const openAIApiKey = defineSecret("OPENAI_API_KEY");

let client: OpenAI;

const OPENAI_MAX_RETRIES = 2;
const OPENAI_TIMEOUT = 20000; // 20 seconds
const CHATGPT_MODEL: OpenAI.ChatModel = "gpt-4o-mini";
const CHATGPT_TEMPERATURE: number = 0;
const CHATGPT_FREQUENCY_PENALTY: number = 0.1;
const CHATGPT_PRESENCE_PENALTY: number = 0.1;
const CHATGPT_MAX_COMPLETION_TOKENS: number = 512;
const CHATGPT_N = 1;

const systemInstructions = `Explain the correct answer to a question as a \
teacher would, being as concise and factual as possible. Use a single \
paragraph and focus on the context and reasoning.

# Notes

- If referencing a law, specify which book and articles are applicable.
- Avoid introducing unrelated information to maintain clarity.
- Use references to authoritative sources where possible.
- Avoid repeating the question or answer itself.`;

function generatePrompt(question: string, correctAnswer: string) {
  return `Explain why "${correctAnswer}" is the correct answer to the question \
"${question}". Explain in the language of the question.`;
}

function getOpenAIClient() {
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

async function generateCompletion(prompt: string) {
  const openai = getOpenAIClient();
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemInstructions },
      { role: "user", content: prompt },
    ],
    model: CHATGPT_MODEL,
    temperature: CHATGPT_TEMPERATURE,
    frequency_penalty: CHATGPT_FREQUENCY_PENALTY,
    presence_penalty: CHATGPT_PRESENCE_PENALTY,
    max_completion_tokens: CHATGPT_MAX_COMPLETION_TOKENS,
    n: CHATGPT_N,
  });

  const result = chatCompletion.choices[0]?.message.content;

  if (typeof result !== "string") {
    throw new Error("No result from gpt-3.5-turbo");
  }

  return result;
}

type ExplainQuestionParams = {
  slug: string;
  accessCode?: string;
  questionId: string;
};

type ExplainQuestionReturn = {
  explanation: string;
} | null;

export const explainQuestion = onCall<
  ExplainQuestionParams,
  Promise<ExplainQuestionReturn>
>(
  { region: "europe-west1", cors: "*", secrets: [openAIApiKey] },
  async ({ data }) => {
    if (!data.slug) {
      throw new HttpsError("invalid-argument", "slug not specified.");
    }

    try {
      const exam = await getDocument(FirestoreCollection.Exams, data.slug);

      if (!exam) {
        return null;
      }

      const secrets = await exam.secrets.get();

      if (!secrets.exists) {
        throw new HttpsError("internal", "secrets not found for exam.");
      }

      if (exam.private === true) {
        // If exam is private, verify access code
        if (!data.accessCode) {
          throw new HttpsError(
            "permission-denied",
            "You need an access code to view this exam.",
          );
        }

        // Find secrets
        if (secrets.data()!.accessCode !== data.accessCode) {
          throw new HttpsError(
            "permission-denied",
            "The access code provided is incorrect.",
          );
        }
      }

      const question = (
        await collectionRef(
          FirestoreCollection.Exams,
          data.slug,
          FirestoreCollection.Questions,
        )
          .doc(data.questionId)
          .get()
      ).data();

      if (!question) {
        return null;
      }

      const correctAnswer = question.answers.find((a) => a.correct);

      if (!correctAnswer) {
        return null;
      }

      const explanation = await generateCompletion(
        generatePrompt(question.description, correctAnswer.description),
      );

      return {
        explanation,
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
