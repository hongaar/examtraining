import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { FirestoreCollection, Question } from "@examtraining/core";
import { collectionRef, getDocument, migrateAnswersIfNeeded } from "./utils";

type CreateExamQuestionParams = {
  slug: string;
  editCode: string;
  data: Question;
};

type CreateExamQuestionReturn = {};

export const createExamQuestion = onCall<
  CreateExamQuestionParams,
  Promise<CreateExamQuestionReturn>
>({ region: "europe-west1", cors: "*" }, async ({ data }) => {
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

    await migrateAnswersIfNeeded(exam);

    // Add question
    await collectionRef(
      FirestoreCollection.Exams,
      data.slug,
      FirestoreCollection.Questions,
    ).add({
      order: data.data.order,
      description: data.data.description,
      explanation: data.data.explanation,
      answers: data.data.answers,
      categories: data.data.categories,
    } as Question);

    logger.info({ message: "created exam question", data });

    return {};
  } catch (error) {
    logger.error(error);
    throw error;
  }
});
