import React from "react";
import { Link } from "wouter";

type Props = {
  children?: React.ReactNode;
};

export function Header({ children }: Props) {
  console.debug("Rendering component Header");

  return (
    <header className="container">
      <hgroup>
        <h1>
          📝 <Link to="/">examtraining.online</Link>
        </h1>
        {children ? <h2>{children}</h2> : null}
      </hgroup>
    </header>
  );
}
