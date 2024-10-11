import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { FirestoreCollection } from "@examtraining/core";
import {
  collectionRef,
  getDefaultCompletionsParams,
  getDocument,
  getOpenAIClient,
  openAIApiKey,
} from "./utils";

function generatePrompt(
  question: string,
  correctAnswer: string,
  incorrectAnswers: string[],
) {
  return `Explain why "${correctAnswer}" is the correct answer instead of "\
${incorrectAnswers.join('" or "')}" to the question "${question}". Explain in the \
language of the question.`;
}

async function generateCompletion({
  user,
  system,
}: {
  user: string;
  system?: string | null;
}) {
  const openai = getOpenAIClient();
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      ...(system ? [{ role: "system" as const, content: system }] : []),
      { role: "user", content: user },
    ],
    ...getDefaultCompletionsParams(),
  });

  const result = chatCompletion.choices[0]?.message.content;

  if (typeof result !== "string") {
    throw new Error("No result from ChatGPT");
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

      const incorrectAnswers = question.answers.filter((a) => !a.correct);

      const explanation = await generateCompletion({
        user: generatePrompt(
          question.description,
          correctAnswer.description,
          incorrectAnswers.map((a) => a.description),
        ),
        system: exam.explanationPrompt,
      });

      return {
        explanation,
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
