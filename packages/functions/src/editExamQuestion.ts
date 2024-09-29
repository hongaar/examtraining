import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import {
  FirestoreCollection,
  Question,
  QuestionWithAnswers,
} from "@examtraining/core";
import { collectionRef, getDocument } from "./utils";

type EditExamQuestionParams = {
  slug: string;
  editCode: string;
  questionId: string;
  data: QuestionWithAnswers;
};

type EditExamQuestionReturn = {};

export const editExamQuestion = onCall<
  EditExamQuestionParams,
  Promise<EditExamQuestionReturn>
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

    // Update question
    const questionRef = collectionRef(
      FirestoreCollection.Exams,
      data.slug,
      FirestoreCollection.Questions,
    ).doc(data.questionId);
    await questionRef.update({
      description: data.data.description,
      explanation: data.data.explanation,
    } as Question);

    // Remove answers collection
    const answers = collectionRef(
      FirestoreCollection.Exams,
      data.slug,
      FirestoreCollection.Questions,
      questionRef.id,
      FirestoreCollection.Answers,
    );
    for (const doc of (await answers.get()).docs) {
      await doc.ref.delete();
    }

    // Add answers
    for (const answer of data.data.answers) {
      await answers.add(answer);
    }

    logger.info({ message: "edited exam question", data });

    return {};
  } catch (error) {
    logger.error(error);
    throw error;
  }
});
