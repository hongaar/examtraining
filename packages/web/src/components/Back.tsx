import { Link } from "wouter";

type Props = { slug: string };

export function Back({ slug }: Props) {
  return (
    <>
      ⬅️&nbsp;
      <Link className="secondary" to={`/${slug}`}>
        Back to exam
      </Link>
    </>
  );
}
