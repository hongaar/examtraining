import { Link } from "wouter";

type Props = {};

export function Filters({}: Props) {
  console.debug("Rendering component Collection/Filters");

  if (null === null) {
    return (
      <nav className="labels">
        <Link href="#" className="label">
          <span className="emoji">⏳</span>
          <span className="name">Laden...</span>
        </Link>
      </nav>
    );
  }

  return <nav className="labels"></nav>;
}
