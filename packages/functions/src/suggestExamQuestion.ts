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
  history?: string[];
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
  questions,
  similarQuestion,
  subject,
  history = [],
}: {
  exam: Exam;
  questions: AddIdAndRef<Question>[];
  similarQuestion?: Question;
  subject?: string;
  history?: string[];
}) {
  const openai = getOpenAIClient();

  // Take random questions
  const nExamples = 2;
  const exampleQuestions = shuffle(questions)
    .slice(0, nExamples)
    .map(toPlainObject);

  const system = `You are a teacher creating a new question for an exam.

# Context

You are given an exam title and description, please use this information as \
context about the language, style and difficulty of the new question.
  
You are given a few examples of the question and answers format, please return \
a new question using this template.

The explanation field should contain context to better understand the correct \
answer.

# Avoid duplicates

You're always given a list of all existing questions. The new question must \
not be a duplicate of or similar to any of these questions.

# Subject of new question

You're sometimes provided with a subject. If it is provided, the new question \
must cover this subject.

You're sometimes provided with similar question. If it is provided, the new \
question must cover the same subject as this question.

If both the subject and similar question are not provided, infer the subject \
from the exam title and description and the list of all existing questions.`;
  const user = `# Exam title
  
${exam.title}

# Exam description

${exam.description ? exam.description : "No description"}
  
# Examples question and answers format

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
}

# List of all existing questions

${
  questions.length + history.length === 0
    ? "No existing questions"
    : [...questions.map((q) => q.description), ...history]
        .map((d) => `- ${d}`)
        .join("\n")
}

# Subject

${subject || "No subject provided"}

# Similar question

${similarQuestion ? similarQuestion.description : "No similar question provided"}
`;

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
    temperature: 0.8,
    top_p: 0.8,
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
    const { slug, editCode, questionId, subject, history } = data;
    if (!slug) {
      throw new HttpsError("invalid-argument", "slug not specified.");
    }

    if (!editCode) {
      throw new HttpsError("invalid-argument", "editCode not specified.");
    }

    try {
      const exam = await getDocument(FirestoreCollection.Exams, slug);

      // Check for document existence
      if (!exam) {
        throw new HttpsError("not-found", "Exam not found.");
      }

      const secrets = await exam.secrets.get();

      if (!secrets.exists) {
        throw new HttpsError("internal", "secrets not found for exam.");
      }

      // Verify edit code
      if (secrets.data()!.editCode !== editCode) {
        throw new HttpsError(
          "permission-denied",
          "The edit code provided is incorrect.",
        );
      }

      const questions = await getCollection(
        FirestoreCollection.Exams,
        slug,
        FirestoreCollection.Questions,
      );

      let similarQuestion;

      if (questionId) {
        let question = await collectionRef(
          FirestoreCollection.Exams,
          slug,
          FirestoreCollection.Questions,
        )
          .doc(questionId)
          .get();

        similarQuestion = toPlainObject(
          question.data() as AddIdAndRef<Question>,
        );
      }

      const question = await generateSuggestion({
        exam,
        questions,
        similarQuestion,
        subject,
        history,
      });

      logger.info({ message: "suggested exam question", data });

      return { question };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
