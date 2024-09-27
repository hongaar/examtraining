import type {
  CallableFunction,
  createExam,
  editExamDetails,
} from "@examtraining/functions";

export enum Functions {
  CreateExam = "createExam",
  EditExamDetails = "editExamDetails",
}

export type FunctionTypes = {
  [Functions.CreateExam]: typeof createExam;
  [Functions.EditExamDetails]: typeof editExamDetails;
};

export type FunctionParams<Function> =
  Function extends CallableFunction<infer Params, unknown> ? Params : never;

export type FunctionReturn<Function> =
  Function extends CallableFunction<unknown, infer Return>
    ? Awaited<Return>
    : never;
