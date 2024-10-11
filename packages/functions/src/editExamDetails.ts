import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { Exam, FirestoreCollection } from "@examtraining/core";
import { collectionRef, docRef, getDocument } from "./utils";

type EditExamDetailsParams = {
  slug: string;
  editCode: string;
  data: Partial<Exam>;
};

type EditExamDetailsReturn = { accessCode?: string };

export const editExamDetails = onCall<
  EditExamDetailsParams,
  Promise<EditExamDetailsReturn>
>({ region: "europe-west1", cors: "*" }, async ({ data }) => {
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

    // Update
    await docRef(FirestoreCollection.Exams, data.slug).update(data.data);

    // Queue mail
    if (!process.env.FUNCTIONS_EMULATOR) {
      if (exam.private === false && data.data.private === true) {
        await mail.add({
          to: secrets.data()!.owner,
          message: {
            subject: "Exam made private",
            html: `Your exam "${exam.title}" is now private.<br/>
<br/>
In order to view it you need an access code.<br/>
The access code is: <code>${secrets.data()!.accessCode}</code><br/>
Access the exam by using this link: <a href="https://examtraining.online/${data.slug}?accessCode=${secrets.data()!.accessCode}">https://examtraining.online/${data.slug}?accessCode=${secrets.data()!.accessCode}</a><br/>
<br/>`,
          },
        });
      }
    }

    logger.info({ message: "edited exam details", data });

    return {
      accessCode: data.data.private ? secrets.data()!.accessCode : undefined,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
});
