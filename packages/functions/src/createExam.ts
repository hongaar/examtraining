import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { Exam, FirestoreCollection, sluggify } from "@examtraining/core";

type CreateExamParams = Partial<Exam>;
type CreateExamReturn = {};

export const createExam = onCall<CreateExamParams, Promise<CreateExamReturn>>(
  { region: "europe-west1", cors: "*" },
  async ({ data }) => {
    if (!data.title) {
      throw new HttpsError("invalid-argument", "title not specified.");
    }

    try {
      const exams = admin.firestore().collection(FirestoreCollection.Exams);
      const slug = sluggify(data.title);

      // Check for unique slug
      const snapshot = await exams.get();
      snapshot.forEach((doc) => {
        if (doc.id === slug) {
          throw new HttpsError(
            "already-exists",
            "exam with the same name already exists.",
          );
        }
      });

      // Add created date
      data.created = new Date();

      await exams.doc(slug).set(data);

      logger.info({ message: "created exam", data });

      return {};
    } catch (error) {
      logger.error(error);
      throw new HttpsError("internal", "Error while creating exam.");
    }
  },
);
