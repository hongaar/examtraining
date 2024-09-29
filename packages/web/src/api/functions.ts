import type {
  CallableFunction,
  createExam,
  createExamQuestion,
  editExamDetails,
  editExamQuestion,
  getExam,
  isSlugAvailable,
  removeExamQuestion,
} from "@examtraining/functions";

export enum Functions {
  IsSlugAvailable = "isSlugAvailable",
  GetExam = "getExam",
  CreateExam = "createExam",
  EditExamDetails = "editExamDetails",
  CreateExamQuestion = "createExamQuestion",
  EditExamQuestion = "editExamQuestion",
  RemoveExamQuestion = "removeExamQuestion",
}

export type FunctionTypes = {
  [Functions.IsSlugAvailable]: typeof isSlugAvailable;
  [Functions.GetExam]: typeof getExam;
  [Functions.CreateExam]: typeof createExam;
  [Functions.EditExamDetails]: typeof editExamDetails;
  [Functions.CreateExamQuestion]: typeof createExamQuestion;
  [Functions.EditExamQuestion]: typeof editExamQuestion;
  [Functions.RemoveExamQuestion]: typeof removeExamQuestion;
};

export type FunctionParams<Function> =
  Function extends CallableFunction<infer Params, unknown> ? Params : never;

export type FunctionReturn<Function> =
  Function extends CallableFunction<unknown, infer Return>
    ? Awaited<Return>
    : never;
