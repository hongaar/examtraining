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
import {
  ACCESS_HASH_LENGTH,
  collectionRef,
  EDIT_HASH_LENGTH,
  getDocument,
} from "./utils";

type CopyExamParams = {
  slug: string;
  editCode: string;
  exam: Partial<Exam>;
  owner: string;
};
type CopyExamReturn = { accessCode?: string; editCode: string };

export const copyExam = onCall<CopyExamParams, Promise<CopyExamReturn>>(
  { region: "europe-west1", cors: "*" },
  async ({ data }) => {
    const { slug, editCode, exam, owner } = data;

    if (!exam.title) {
      throw new HttpsError("invalid-argument", "title not specified.");
    }

    if (!slug) {
      throw new HttpsError("invalid-argument", "slug not specified.");
    }

    if (!editCode) {
      throw new HttpsError("invalid-argument", "editCode not specified.");
    }

    try {
      const firestore = admin.firestore();
      const exams = collectionRef(FirestoreCollection.Exams);
      const mail = collectionRef(FirestoreCollection.Mail);
      const secrets = collectionRef(FirestoreCollection.Secrets);

      const sourceExam = await getDocument(FirestoreCollection.Exams, slug);

      // Check for document existence
      if (!sourceExam) {
        throw new HttpsError("not-found", "Source exam not found.");
      }

      const sourceSecrets = await sourceExam.secrets.get();

      if (!sourceSecrets.exists) {
        throw new HttpsError("internal", "secrets not found for source exam.");
      }

      // Verify edit code
      if (sourceSecrets.data()!.editCode !== data.editCode) {
        throw new HttpsError(
          "permission-denied",
          "The edit code provided is incorrect.",
        );
      }

      // Check for unique slug
      const newSlug = sluggify(exam.title);
      const snapshot = await exams.get(); // @todo: simply get document and see if it exists
      snapshot.forEach((doc) => {
        if (doc.id === newSlug) {
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

      // Create new exam
      exam.created = new Date();
      exam.secrets = firestore.doc(
        `/${FirestoreCollection.Secrets}/${secret.id}`,
      ) as DocumentReference<Secret>;
      await exams.doc(newSlug).set(exam as Exam);

      // Get source questions
      const questions = await collectionRef(
        FirestoreCollection.Exams,
        data.slug,
        FirestoreCollection.Questions,
      )
        .orderBy("order")
        .get();

      // Copy questions
      for (const question of questions.docs) {
        await collectionRef(
          FirestoreCollection.Exams,
          newSlug,
          FirestoreCollection.Questions,
        ).add(question.data());
      }

      // Queue mail
      if (!process.env.FUNCTIONS_EMULATOR) {
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
      }

      logger.info({ message: "copied exam", data });

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
