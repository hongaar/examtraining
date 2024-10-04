import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { Exam } from "@examtraining/core";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { onDocumentDeleted } from "firebase-functions/v2/firestore";

export const onExamDeleted = onDocumentDeleted(
  "exams/{examId}",
  async (event) => {
    const snap = event.data as QueryDocumentSnapshot<Exam> | undefined;
    const exam = snap?.data();

    if (!exam) {
      throw new Error("could not grab snapshot data.");
    }

    try {
      await exam.secrets.delete();

      logger.info({ message: "deleted secret", data: exam });

      return {};
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
