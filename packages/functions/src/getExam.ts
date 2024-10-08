import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { ExamWithQuestions, FirestoreCollection } from "@examtraining/core";
import { collectionRef, getDocument, toIdAndRef, toPlainObject } from "./utils";

type GetExamParams = { slug: string; accessCode?: string; editCode?: string };
type GetExamReturn = ExamWithQuestions | null;

export const getExam = onCall<GetExamParams, Promise<GetExamReturn>>(
  { region: "europe-west1", cors: "*" },
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

      if (data.editCode) {
        // If we have an edit code, verify it now
        if (secrets.data()!.editCode !== data.editCode) {
          throw new HttpsError(
            "permission-denied",
            "The edit code provided is incorrect.",
          );
        }
      } else if (exam.private === true) {
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

      const questions = toIdAndRef(
        await collectionRef(
          FirestoreCollection.Exams,
          data.slug,
          FirestoreCollection.Questions,
        )
          .orderBy("order")
          .get(),
      );

      const plainQuestions = questions.map((question) =>
        toPlainObject(question),
      );
      const plainExam = toPlainObject(exam);
      const examWithQuestions = {
        ...plainExam,
        questions: plainQuestions,
      } as ExamWithQuestions;

      return examWithQuestions;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
