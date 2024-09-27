import type {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";

export enum FirestoreCollection {
  Exams = "exams",
  Questions = "questions",
  Answers = "answers",
}

export type Answer = {
  description: string;
};

export type Question = {
  description: string;
  answers: CollectionReference<Answer>;
  correctAnswer: DocumentReference<Answer>;
  explanation: string;
};

export type Secrets = {
  collection: DocumentReference<Exam>;
  readSecret: string | null;
  writeSecret: string;
};

export type Exam = {
  title: string;
  description: string | null;
  owner: string; // email address
  private: boolean;
  created: Date;
  questions: CollectionReference<Question>;
};

type DocEnum = {
  [FirestoreCollection.Exams]: Exam;
  [FirestoreCollection.Questions]: Question;
  [FirestoreCollection.Answers]: Answer;
};

export type Doc<T extends FirestoreCollection> = DocEnum[T];

export type DocWithId<T extends FirestoreCollection> = AddId<DocEnum[T]>;

export type AddId<T> = { id: string } & T;

export type AddIdAndRef<T> = { id: string; _ref: DocumentReference<T> } & T;
