import type {
  CallableFunction,
  copyExam,
  createExam,
  createExamQuestion,
  editExamDetails,
  editExamQuestion,
  explainQuestion,
  getExam,
  isSlugAvailable,
  removeExamQuestion,
  resetExam,
} from "@examtraining/functions";

export enum Functions {
  IsSlugAvailable = "isSlugAvailable",
  GetExam = "getExam",
  CreateExam = "createExam",
  EditExamDetails = "editExamDetails",
  CopyExam = "copyExam",
  CreateExamQuestion = "createExamQuestion",
  EditExamQuestion = "editExamQuestion",
  RemoveExamQuestion = "removeExamQuestion",
  ExplainQuestion = "explainQuestion",
  ResetExam = "resetExam",
}

export type FunctionTypes = {
  [Functions.IsSlugAvailable]: typeof isSlugAvailable;
  [Functions.GetExam]: typeof getExam;
  [Functions.CreateExam]: typeof createExam;
  [Functions.EditExamDetails]: typeof editExamDetails;
  [Functions.CreateExamQuestion]: typeof createExamQuestion;
  [Functions.EditExamQuestion]: typeof editExamQuestion;
  [Functions.RemoveExamQuestion]: typeof removeExamQuestion;
  [Functions.ExplainQuestion]: typeof explainQuestion;
  [Functions.CopyExam]: typeof copyExam;
  [Functions.ResetExam]: typeof resetExam;
};

export type FunctionParams<Function> =
  Function extends CallableFunction<infer Params, unknown> ? Params : never;

export type FunctionReturn<Function> =
  Function extends CallableFunction<unknown, infer Return>
    ? Awaited<Return>
    : never;
