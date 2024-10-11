import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import {
  AddIdAndRef,
  Exam,
  FirestoreCollection,
  PlainDoc,
  Question,
  shuffle,
} from "@examtraining/core";
import {
  collectionRef,
  getCollection,
  getDefaultCompletionsParams,
  getDocument,
  getOpenAIClient,
  openAIApiKey,
  toPlainObject,
} from "./utils";

type SuggestExamQuestionParams = {
  slug: string;
  editCode: string;
  questionId?: string;
  subject?: string;
};

type SuggestExamQuestionReturn = {
  question: {
    description: string;
    explanation: string;
    answers: { description: string; correct: boolean }[];
    categories?: string[];
  };
};

async function generateSuggestion({
  exam,
  exampleQuestions,
  subject,
}: {
  exam: Exam;
  exampleQuestions: Question[];
  subject?: string;
}) {
  const openai = getOpenAIClient();
  const system =
    "You are a teacher creating questions for an exam. You are given a set of example questions and optionally a subject to help you create a new question. The explanation field should contain context to better understand the correct answer.";
  const user = `Exam title: ${exam.title}

Exam description: ${exam.description ? exam.description : "No description"}
  
Example questions:

${
  exampleQuestions.length === 0
    ? "No example questions"
    : exampleQuestions
        .map(
          (question) => `\`\`\`json
${JSON.stringify(question, null, 2)}
\`\`\``,
        )
        .join("\n\n")
}${subject ? `\n\nSubject: ${subject}` : ""}`;
  const chatCompletion = await openai.beta.chat.completions.parse({
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: user,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "question_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            description: {
              type: "string",
            },
            explanation: {
              type: "string",
            },
            answers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: {
                    type: "string",
                  },
                  correct: {
                    type: "boolean",
                  },
                },
                required: ["description", "correct"],
                additionalProperties: false,
              },
            },
            categories: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          required: ["description", "explanation", "answers", "categories"],
          additionalProperties: false,
        },
      },
    },
    ...getDefaultCompletionsParams(),
    temperature: 0.3,
  });

  const result = chatCompletion.choices[0]?.message;

  if (!result.parsed || result.refusal) {
    throw new Error("No result from ChatGPT");
  }

  return result.parsed as Question;
}

export const suggestExamQuestion = onCall<
  SuggestExamQuestionParams,
  Promise<SuggestExamQuestionReturn>
>(
  { region: "europe-west1", cors: "*", secrets: [openAIApiKey] },
  async ({ data }) => {
    if (!data.slug) {
      throw new HttpsError("invalid-argument", "slug not specified.");
    }

    if (!data.editCode) {
      throw new HttpsError("invalid-argument", "editCode not specified.");
    }

    try {
      const exam = await getDocument(FirestoreCollection.Exams, data.slug);

      // Check for document existence
      if (!exam) {
        throw new HttpsError("not-found", "Exam not found.");
      }

      const secrets = await exam.secrets.get();

      if (!secrets.exists) {
        throw new HttpsError("internal", "secrets not found for exam.");
      }

      // Verify edit code
      if (secrets.data()!.editCode !== data.editCode) {
        throw new HttpsError(
          "permission-denied",
          "The edit code provided is incorrect.",
        );
      }

      let exampleQuestions: PlainDoc<AddIdAndRef<Question>>[] = [];

      if (data.questionId) {
        let question = await collectionRef(
          FirestoreCollection.Exams,
          data.slug,
          FirestoreCollection.Questions,
        )
          .doc(data.questionId)
          .get();

        exampleQuestions = [
          toPlainObject(question.data() as AddIdAndRef<Question>),
        ];
      } else {
        const allQuestions = await getCollection(
          FirestoreCollection.Exams,
          data.slug,
          FirestoreCollection.Questions,
        );

        // Take 5 random questions
        exampleQuestions = shuffle(allQuestions).slice(0, 5).map(toPlainObject);
      }

      const question = await generateSuggestion({
        exam,
        exampleQuestions,
        subject: data.subject,
      });

      logger.info({ message: "suggested exam question", data });

      return { question };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
