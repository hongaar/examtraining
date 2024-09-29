import type {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";

export enum FirestoreCollection {
  Exams = "exams",
  Secrets = "secrets",
  Mail = "mail",
  Questions = "questions",
  Answers = "answers",
}

export type Mail = {
  to: string;
  message: {
    subject: string;
    html: string;
  };
};

export type Answer = {
  order: number;
  description: string;
  correct: boolean;
};

export type Question = {
  order: number;
  description: string;
  answers: CollectionReference<Answer>;
  explanation: string;
};

export type QuestionWithAnswers = Omit<Question, "answers"> & {
  answers: AddId<Answer>[];
};

export type Secret = {
  owner: string; // email address
  accessCode: string;
  editCode: string;
};

export type Exam = {
  title: string;
  description: string | null;
  questions: CollectionReference<Question>;
  private: boolean;
  created: Date;
  secrets: DocumentReference<Secret>;
};

export type ExamWithQuestions = Omit<Exam, "questions" | "secrets"> & {
  id: string;
  questions: AddId<QuestionWithAnswers>[];
};

type DocEnum = {
  [FirestoreCollection.Mail]: Mail;
  [FirestoreCollection.Exams]: Exam;
  [FirestoreCollection.Secrets]: Secret;
  [FirestoreCollection.Questions]: Question;
  [FirestoreCollection.Answers]: Answer;
};

export type Doc<T extends FirestoreCollection> = DocEnum[T];

export type DocWithId<T extends FirestoreCollection> = AddId<DocEnum[T]>;

export type AddId<T> = { id: string } & T;

export type AddIdAndRef<T> = { id: string; _ref: DocumentReference<T> } & T;

type FilteredKeys<T> = {
  [P in keyof T]: T[P] extends DocumentReference<infer U>
    ? never
    : T[P] extends CollectionReference
      ? never
      : P;
}[keyof T];

export type PlainDoc<T> = AddId<{
  [K in FilteredKeys<T>]: T[K];
}>;
