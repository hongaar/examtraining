import { AddIdAndRef, Doc, FirestoreCollection } from "@examtraining/core";
import {
  collection,
  collectionGroup,
  CollectionReference,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  getFirestore,
  Query,
  query,
  QueryConstraint,
  QuerySnapshot,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { useCallback, useMemo } from "react";
import {
  useCollection as useBaseCollection,
  useCollectionOnce as useBaseCollectionOnce,
  useDocumentData as useBaseDocument,
  useDocumentDataOnce as useBaseDocumentOnce,
} from "react-firebase-hooks/firestore";
import { USE_EMULATOR } from "../api";
import { useFirebase } from "./useFirebase";

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

export function useFirestore() {
  const firebase = useFirebase();
  const firestore = useMemo(() => {
    const db = getFirestore(firebase.app);

    if (USE_EMULATOR && process.env.NODE_ENV === "development") {
      try {
        connectFirestoreEmulator(db, "localhost", 8080);
      } catch {}
    }

    return db;
  }, [firebase]);

  return firestore;
}

export function useCollectionRef(...path: CollectionPath) {
  const firestore = useFirestore();

  return useMemo(
    () => collection(firestore, path[0], ...path.slice(1)),
    [path, firestore],
  );
}

export function useCollectionGroupRef(collectionId: FirestoreCollection) {
  const firestore = useFirestore();

  return useMemo(
    () => collectionGroup(firestore, collectionId),
    [collectionId, firestore],
  );
}

export function useDocRef<T extends FirestoreCollection>(
  collectionId: T,
  docId: string,
) {
  const firestore = useFirestore();

  return useMemo(
    () =>
      doc(collection(firestore, collectionId), docId) as DocumentReference<
        Doc<T>
      >,
    [collectionId, docId, firestore],
  );
}

export function useCollectionDataFromRef<T extends DocumentData>(
  ref: CollectionReference | Query,
) {
  const [snapshot, loading, error] = useBaseCollection<T>(ref as any);

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return null;
  }

  return getCollectionData(snapshot);
}

export function useCollectionDataOnceFromRef<T extends DocumentData>(
  ref: CollectionReference | Query,
) {
  const [snapshot, loading, error, reload] = useBaseCollectionOnce<T>(
    ref as any,
  );

  return useMemo(() => {
    if (error) {
      console.error(error);
    }

    if (loading || !snapshot) {
      return [null] as const;
    }

    return [getCollectionData(snapshot), reload] as const;
  }, [error, loading, reload, snapshot]);
}

export function useCollection<R extends CollectionPath>(...path: R) {
  const collectionRef = useCollectionRef(...path);

  return useCollectionDataFromRef<Doc<LastElementOf<R>>>(collectionRef);
}

export function useCollectionOnce<R extends CollectionPath>(
  ...collectionRef: R
) {
  const ref = useCollectionRef(...collectionRef);

  return useCollectionDataOnceFromRef<Doc<LastElementOf<R>>>(ref);
}

export function useCollectionGroup<T extends FirestoreCollection>(
  collectionId: T,
) {
  const ref = useCollectionGroupRef(collectionId);

  return useCollectionDataFromRef<Doc<T>>(ref);
}

export function useCollectionGroupOnce<T extends FirestoreCollection>(
  collectionId: T,
) {
  const ref = useCollectionGroupRef(collectionId);

  return useCollectionDataOnceFromRef<Doc<T>>(ref);
}

export function useQueryFromRef<T extends DocumentData>(
  ref: Query,
  ...queryConstraints: QueryConstraint[]
) {
  const [snapshot, loading, error] = useBaseCollection<T>(
    query(ref as any, ...queryConstraints),
  );

  if (error) {
    console.error(error);
  }

  if (loading || !snapshot) {
    return [];
  }

  return getCollectionData(snapshot);
}

export function useQueryOnceFromRef<T extends DocumentData>(
  ref: Query,
  ...queryConstraints: QueryConstraint[]
) {
  const [snapshot, loading, error, reload] = useBaseCollectionOnce<T>(
    query(ref as any, ...queryConstraints),
  );

  return useMemo(() => {
    if (error) {
      console.error(error);
    }

    if (loading || !snapshot) {
      return [null] as const;
    }

    return [getCollectionData(snapshot), reload] as const;
  }, [error, loading, reload, snapshot]);
}

export function useQuery<R extends CollectionPath>(
  collectionRef: R,
  ...queryConstraints: QueryConstraint[]
) {
  const ref = useCollectionRef(...collectionRef);

  return useQueryFromRef<Doc<LastElementOf<R>>>(ref, ...queryConstraints);
}

export function useQueryOnce<R extends CollectionPath>(
  collectionRef: R,
  ...queryConstraints: QueryConstraint[]
) {
  const ref = useCollectionRef(...collectionRef);

  return useQueryOnceFromRef<Doc<LastElementOf<R>>>(ref, ...queryConstraints);
}

export function useDocument<T extends FirestoreCollection>(
  collectionId: T,
  docId: string,
) {
  const docRef = useDocRef(collectionId, docId);
  const [data, loading, error] = useBaseDocument<Doc<T>>(docRef as any);

  if (error) {
    console.error(error);
  }

  if (loading) {
    return null;
  }

  if (!data) {
    return;
  }

  return parseDocDataWithIdAndRef(data, docId, docRef);
}

export function useDocumentOnce<T extends FirestoreCollection>(
  collectionId: T,
  docId: string,
) {
  const docRef = useDocRef(collectionId, docId);
  const [data, loading, error] = useBaseDocumentOnce<Doc<T>>(docRef as any);

  if (error) {
    console.error(error);
  }

  if (loading) {
    return null;
  }

  if (!data) {
    return;
  }

  return parseDocData(data);
}

export function useDocWriter<R extends CollectionPath>(...collectionRef: R) {
  const ref = useCollectionRef(...collectionRef);

  return useCallback(
    async function (docId: string, data: Partial<Doc<LastElementOf<R>>>) {
      await setDoc(doc(ref, docId), data, { merge: true });
    },
    [ref],
  );
}

export function useDocDeleter<R extends CollectionPath>(...collectionRef: R) {
  const ref = useCollectionRef(...collectionRef);

  return useCallback(
    async function (docId: string) {
      await deleteDoc(doc(ref, docId));
    },
    [ref],
  );
}

export function getCollectionData<T extends DocumentData>(
  snapshot: QuerySnapshot<T>,
) {
  const data: AddIdAndRef<T>[] = [];

  snapshot.forEach(function (doc) {
    // @ts-ignore
    data.push({ id: doc.id, _ref: doc.ref, ...parseDocData(doc.data()) });
  });

  return data;
}

function parseDocDataWithIdAndRef<T extends DocumentData>(
  data: T,
  id: string,
  ref: DocumentReference<T>,
) {
  return { id, _ref: ref, ...parseDocData(data) };
}

function parseDocData<T extends DocumentData>(data: T) {
  Object.entries(data).forEach(([key, value]) => {
    if (
      typeof value === "object" &&
      value !== null &&
      value.constructor === Object
    ) {
      // console.log({ value });
      data[key as keyof T] = parseDocData(value);
    }
    if (value instanceof Timestamp) {
      data[key as keyof T] = value.toDate() as any;
    }
  });

  return data;
}
