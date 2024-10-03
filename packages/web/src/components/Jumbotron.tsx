import React from "react";

type Props = {
  children: [React.ReactNode, React.ReactNode];
};

export function Jumbotron({ children }: Props) {
  console.debug("Rendering component Jumbotron");

  return (
    <div className="jumbotron">
      <div>{children[0]}</div>
      <div>{children[1]}</div>
    </div>
  );
}
