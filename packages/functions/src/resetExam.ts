import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { FirestoreCollection, Secret } from "@examtraining/core";
import * as crypto from "node:crypto";
import {
  ACCESS_HASH_LENGTH,
  collectionRef,
  EDIT_HASH_LENGTH,
  getDocument,
} from "./utils";

type ResetExamParams = {
  slug: string;
  editCode: string;
};
type ResetExamReturn = { accessCode?: string; editCode: string };

export const resetExam = onCall<ResetExamParams, Promise<ResetExamReturn>>(
  { region: "europe-west1", cors: "*" },
  async ({ data }) => {
    if (!data.slug) {
      throw new HttpsError("invalid-argument", "slug not specified.");
    }

    if (!data.editCode) {
      throw new HttpsError("invalid-argument", "editCode not specified.");
    }

    try {
      const mail = collectionRef(FirestoreCollection.Mail);

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

      // Create secret
      const accessCode = crypto.randomBytes(ACCESS_HASH_LENGTH).toString("hex");
      const editCode = crypto.randomBytes(EDIT_HASH_LENGTH).toString("hex");
      await secrets.ref.update({
        accessCode,
        editCode,
      } as Secret);

      // Queue mail
      if (!process.env.FUNCTIONS_EMULATOR) {
        await mail.add({
          to: secrets.data()!.owner,
          message: {
            subject: "Exam codes reset",
            html: `The codes for your exam "${exam.title}" have been reset.<br/>
<br/>
${
  exam.private
    ? `This exam is private. In order to view it you need an access code.<br/>
The access code is: <code>${accessCode}</code><br/>
Access the exam by using this link: <a href="https://examtraining.online/${exam.id}?accessCode=${accessCode}">https://examtraining.online/${exam.id}?accessCode=${accessCode}</a><br/>
<br/>`
    : `Access the exam by using this link: <a href="https://examtraining.online/${exam.id}">https://examtraining.online/${exam.id}</a><br/>
<br/>`
}
In order to make changes to this exam, you need an edit code.<br/>
The edit code is: <code>${editCode}</code><br/>
Edit the exam by using this link: <a href="https://examtraining.online/${exam.id}/edit?editCode=${editCode}">https://examtraining.online/${exam.id}/edit?editCode=${editCode}</a>`,
          },
        });
      }

      logger.info({ message: "exam codes reset", data });

      return {
        accessCode,
        editCode,
      };
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
