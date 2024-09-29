import admin from "firebase-admin";

try {
  admin.initializeApp();
} catch (error) {}

import { logger } from "firebase-functions/v2";
import { HttpsError, onCall } from "firebase-functions/v2/https";
// @ts-ignore
import { FirestoreCollection } from "@examtraining/core";
import { getDocument } from "./utils";

type IsSlugAvailableParams = { slug: string };
type IsSlugAvailableReturn = boolean;

export const isSlugAvailable = onCall<
  IsSlugAvailableParams,
  Promise<IsSlugAvailableReturn>
>({ region: "europe-west1", cors: "*" }, async ({ data }) => {
  if (!data.slug) {
    throw new HttpsError("invalid-argument", "slug not specified.");
  }

  const { slug } = data;

  try {
    const exam = await getDocument(FirestoreCollection.Exams, slug);

    return !exam;
  } catch (error) {
    logger.error(error);
    throw error;
  }
});
