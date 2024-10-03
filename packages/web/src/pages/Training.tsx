import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { Footer, Header, Loading, Main } from "../components";
import { TrainQuestions } from "../components/Training";
import {
  PermissionDenied,
  useAccessCode,
  useCachedExam,
  useTraining,
} from "../hooks";
import { NotFound } from "./NotFound";
import { ProvideAccessCode } from "./ProvideAccessCode";

export function Training({ params }: { params: { exam: string } }) {
  console.debug("Rendering page Training");

  const slug = params.exam ? decodeURIComponent(params.exam) : "";
  const accessCode = useAccessCode();
  const { exam } = useCachedExam(slug, { accessCode });
  const { trainingQuestions } = useTraining(slug);
  const [, setLocation] = useLocation();

  if (exam instanceof PermissionDenied) {
    return <ProvideAccessCode returnTo={`/${slug}`} />;
  }

  if (exam === undefined) {
    return <Loading>Loading exam...</Loading>;
  }

  if (exam === null) {
    return <NotFound />;
  }

  if (trainingQuestions.length === 0) {
    setLocation(`/${slug}/new-training`, { replace: true });
  }

  return (
    <>
      <Helmet>
        <title>{exam.title}</title>
      </Helmet>
      <Header>Exam training</Header>
      <Main>
        <TrainQuestions exam={exam} />
      </Main>
      <Footer />
    </>
  );
}
