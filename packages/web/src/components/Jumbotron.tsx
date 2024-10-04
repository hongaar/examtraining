import React from "react";

type Props = {
  children: [React.ReactNode, React.ReactNode?];
  className?: string;
};

export function Jumbotron({ children, className }: Props) {
  console.debug("Rendering component Jumbotron");

  return (
    <div className={`jumbotron ${className || ""}`}>
      <div>{children[0]}</div>
      {children[1] ? <div>{children[1]}</div> : null}
    </div>
  );
}
