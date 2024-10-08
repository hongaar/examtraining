import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast";
import { Route, Switch, useLocation } from "wouter";
import { useAnalytics } from "./hooks";
import {
  BulkAddExamQuestions,
  CopyExam,
  EditExamDetails,
  EditExamQuestions,
  Exam,
  Homepage,
  NewExam,
  NewTraining,
  NotFound,
  Training,
} from "./pages";

export function App() {
  console.debug("Rendering App");

  useAnalytics();

  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Helmet titleTemplate="%s / examtraining.online" />
      <Toaster />
      <Switch>
        <Route path="/new" component={NewExam} />
        <Route path="/:exam/new-training" component={NewTraining} />
        <Route path="/:exam/training" component={Training} />
        <Route path="/:exam/edit" component={EditExamDetails} />
        <Route path="/:exam/questions" component={EditExamQuestions} />
        <Route path="/:exam/bulk" component={BulkAddExamQuestions} />
        <Route path="/:exam/copy" component={CopyExam} />
        <Route path="/:exam" component={Exam} />
        <Route path="/" component={Homepage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
