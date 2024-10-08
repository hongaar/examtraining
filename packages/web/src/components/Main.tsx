import React from "react";

type Props = {
  children: React.ReactNode;
  fluid?: boolean;
  className?: string;
};

export function Main({ children, fluid = false, className }: Props) {
  console.debug("Rendering component Main");

  return (
    <main
      className={`${fluid ? "container-fluid" : "container"} ${className || ""}`}
    >
      {children}
    </main>
  );
}
