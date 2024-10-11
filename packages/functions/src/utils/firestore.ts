import {
  AddIdAndRef,
  Doc,
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

export const EDIT_HASH_LENGTH = 8;
export const ACCESS_HASH_LENGTH = 2;

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

export function toPlainObject<T extends AddIdAndRef<DocumentData> | null>(
  data: T,
): T extends null ? null : PlainDoc<T> {
  if (data === null) {
    return null as any;
  }

  const copy = { ...data };

  Object.entries(copy).forEach(([key, value]) => {
    if (key === "_ref") {
      delete copy[key as any];
    }

    if (
      typeof value === "object" &&
      value !== null &&
      (value.constructor === DocumentReference ||
        value.constructor === CollectionReference)
    ) {
      delete copy[key as any];
    }

    if (
      typeof value === "object" &&
      value !== null &&
      value.constructor === Object
    ) {
      copy[key as any] = toPlainObject(value) as any;
    }

    if (value instanceof Timestamp) {
      copy[key as any] = { _time: value.toDate().toISOString() } as any;
    }
  });

  return copy as any;
}
