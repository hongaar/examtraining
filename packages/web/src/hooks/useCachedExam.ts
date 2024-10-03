import { useContext, useEffect } from "react";
import { ExamContext } from "../context";

export function useCachedExam(
  slug: string,
  { accessCode }: { accessCode?: string } = {},
) {
  const { slug: slugFromContext, fetchSlug, exam } = useContext(ExamContext);

  useEffect(() => {
    if (slug !== slugFromContext) {
      fetchSlug(slug, { accessCode });
    }
  });

  return { exam };
}

export function useFlushCachedExam() {
  const { flush } = useContext(ExamContext);

  return flush;
}
