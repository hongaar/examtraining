import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import {
  Exam,
  FirestoreCollection,
  Secret,
  sluggify,
} from "@examtraining/core";
import { DocumentReference } from "firebase-admin/firestore";
import * as crypto from "node:crypto";
import { collectionRef } from "./utils";

const EDIT_HASH_LENGTH = 8;
const ACCESS_HASH_LENGTH = 2;

type CreateExamParams = { exam: Partial<Exam>; owner: string };
type CreateExamReturn = {};

export const createExam = onCall<CreateExamParams, Promise<CreateExamReturn>>(
  { region: "europe-west1", cors: "*" },
  async ({ data }) => {
    const { exam, owner } = data;
    if (!exam.title) {
      throw new HttpsError("invalid-argument", "title not specified.");
    }

    try {
      const firestore = admin.firestore();
      const exams = collectionRef(FirestoreCollection.Exams);
      const mail = collectionRef(FirestoreCollection.Mail);
      const secrets = collectionRef(FirestoreCollection.Secrets);

      // Check for unique slug
      const slug = sluggify(exam.title);
      const snapshot = await exams.get();
      snapshot.forEach((doc) => {
        if (doc.id === slug) {
          throw new HttpsError(
            "already-exists",
            "exam with the same name already exists.",
          );
        }
      });

      // Create secret
      const accessCode = crypto.randomBytes(ACCESS_HASH_LENGTH).toString("hex");
      const editCode = crypto.randomBytes(EDIT_HASH_LENGTH).toString("hex");
      const secret = await secrets.add({
        owner,
        accessCode,
        editCode,
      } as Secret);

      // Create exam
      exam.created = new Date();
      exam.secrets = firestore.doc(
        `/${FirestoreCollection.Secrets}/${secret.id}`,
      ) as DocumentReference<Secret>;
      await exams.doc(slug).set(exam as Exam);

      // Queue mail
      await mail.add({
        to: owner,
        message: {
          subject: "Exam created",
          html: `Your exam "${exam.title}" has been created.<br/>
<br/>
${
  exam.private
    ? `This exam is private. In order to view it you need an access code.<br/>
The access code is: <code>${accessCode}</code><br/>
Access the exam by using this link: <a href="https://examtraining.online/${slug}?accessCode=${accessCode}">https://examtraining.online/${slug}?accessCode=${accessCode}</a><br/>
<br/>`
    : `Access the exam by using this link: <a href="https://examtraining.online/${slug}">https://examtraining.online/${slug}</a><br/>
<br/>`
}
In order to make changes to this exam, you need an edit code.<br/>
The edit code is: <code>${editCode}</code><br/>
Edit the exam by using this link: <a href="https://examtraining.online/${slug}/edit?editCode=${editCode}">https://examtraining.online/${slug}/edit?editCode=${editCode}</a>`,
        },
      });

      logger.info({ message: "created exam", data });

      return {};
    } catch (error) {
      logger.error(error);
      throw error;
    }
  },
);
