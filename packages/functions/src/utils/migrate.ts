import {
  AddIdAndRef,
  Answer,
  Exam,
  FirestoreCollection,
} from "@examtraining/core";
import { collectionRef, firestore, toIdAndRef } from "./firestore";

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
