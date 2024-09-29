import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast";
import { Route, Switch } from "wouter";
import {
  EditExamDetails,
  EditExamQuestions,
  Exam,
  Homepage,
  NewExam,
  NotFound,
  Training,
} from "./pages";

export function App() {
  console.debug("Rendering App");

  return (
    <>
      <Helmet titleTemplate="%s / examtraining.online" />
      <Toaster />
      <Switch>
        <Route path="/new" component={NewExam} />
        <Route path="/:exam/training" component={Training} />
        <Route path="/:exam/edit" component={EditExamDetails} />
        <Route path="/:exam/questions" component={EditExamQuestions} />
        <Route path="/:exam" component={Exam} />
        <Route path="/" component={Homepage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
