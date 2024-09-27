import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { Exam, FirestoreCollection } from "@examtraining/core";

type CreateExamParams = {
  slug: string;
  data: Partial<Exam>;
};

type CreateExamReturn = {};

export const editExamDetails = onCall<
  CreateExamParams,
  Promise<CreateExamReturn>
>({ region: "europe-west1", cors: "*" }, async ({ data }) => {
  if (!data.slug) {
    throw new HttpsError("invalid-argument", "slug not specified.");
  }

  try {
    const exams = admin.firestore().collection(FirestoreCollection.Exams);

    // Check for document existence
    const docRef = exams.doc(data.slug);
    if (!(await docRef.get())) {
      throw new HttpsError("not-found", "Exam not found.");
    }

    await docRef.update(data.data);

    logger.info({ message: "edited exam", data });

    return {};
  } catch (error) {
    logger.error(error);
    throw new HttpsError("internal", "Error while editing exam.");
  }
});
