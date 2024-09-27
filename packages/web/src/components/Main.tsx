import React from "react";

type Props = {
  children: React.ReactNode;
};

export function Main({ children }: Props) {
  console.debug("Rendering component Main");

  return <main className="container">{children}</main>;
}
