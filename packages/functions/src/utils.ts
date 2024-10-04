import {
  AddIdAndRef,
  Answer,
  Doc,
  Exam,
  FirestoreCollection,
  PlainDoc,
} from "@examtraining/core";
import admin from "firebase-admin";
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  QuerySnapshot,
  Timestamp,
} from "firebase-admin/firestore";

type LastElementOf<T extends readonly unknown[]> = T extends readonly [
  ...unknown[],
  infer Last,
]
  ? Last
  : never;

type CollectionPath =
  | [FirestoreCollection]
  | [FirestoreCollection, string, FirestoreCollection]
  | [
      FirestoreCollection,
      string,
      FirestoreCollection,
      string,
      FirestoreCollection,
    ];

export function firestore() {
  return admin.firestore();
}

export function collectionRef<T extends CollectionPath>(...path: T) {
  return firestore().collection(path.join("/")) as CollectionReference<
    Doc<LastElementOf<T>>
  >;
}

export function docRef<T extends FirestoreCollection>(
  collectionId: T,
  docId: string,
) {
  return firestore().collection(collectionId).doc(docId) as DocumentReference<
    Doc<T>
  >;
}

export async function getCollection<T extends CollectionPath>(...path: T) {
  const ref = collectionRef(...path);

  return toIdAndRef(await ref.get());
}

export async function getDocument<T extends FirestoreCollection>(
  collectionId: T,
  docId: string,
) {
  const ref = docRef(collectionId, docId);
  const doc = await ref.get();

  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, _ref: doc.ref, ...doc.data() } as AddIdAndRef<Doc<T>>;
}

export function toIdAndRef<T>(snapshot: QuerySnapshot<T>) {
  const collection = [] as AddIdAndRef<T>[];

  snapshot.forEach((doc) => {
    if (doc.exists) {
      collection.push({ id: doc.id, _ref: doc.ref, ...doc.data() });
    }
  });

  return collection;
}

export function toPlainObject<T extends AddIdAndRef<DocumentData>>(
  data: T | null,
) {
  if (data === null) {
    return null;
  }

  const copy = { ...data };

  Object.entries(copy).forEach(([key, value]) => {
    if (key === "_ref") {
      delete copy[key as keyof T];
    }

    if (
      typeof value === "object" &&
      value !== null &&
      (value.constructor === DocumentReference ||
        value.constructor === CollectionReference)
    ) {
      delete copy[key as keyof T];
    }

    if (
      typeof value === "object" &&
      value !== null &&
      value.constructor === Object
    ) {
      copy[key as keyof T] = toPlainObject(value) as any;
    }

    if (value instanceof Timestamp) {
      copy[key as keyof T] = { _time: value.toDate().toISOString() } as any;
    }
  });

  return copy as PlainDoc<T>;
}

export async function migrateAnswersIfNeeded(exam: AddIdAndRef<Exam>) {
  // Read first question
  const question = (
    await collectionRef(
      FirestoreCollection.Exams,
      exam.id,
      FirestoreCollection.Questions,
    )
      .limit(1)
      .get()
  ).docs[0];

  if (question) {
    if (typeof question.data().answers === "undefined") {
      const questions = toIdAndRef(
        await collectionRef(
          FirestoreCollection.Exams,
          exam.id,
          FirestoreCollection.Questions,
        )
          .orderBy("order")
          .get(),
      );

      for (const key in questions) {
        const question = questions[key];
        const answersRef = collectionRef(
          FirestoreCollection.Exams,
          exam.id,
          FirestoreCollection.Questions,
          question.id,
          FirestoreCollection.Answers,
        );
        const answers = toIdAndRef(await answersRef.orderBy("order").get());

        const plainAnswers: Answer[] = [];
        answers.forEach(({ id, description, order, correct }) => {
          plainAnswers.push({
            id,
            description,
            order,
            correct,
          });
        });

        // Remove answers collection
        await firestore().recursiveDelete(answersRef);

        // Add answers to question doc
        await question._ref.update({
          answers: plainAnswers,
        });
      }

      console.log(
        "first question still had answers collection, migrated all questions",
      );
    }
  }
}
