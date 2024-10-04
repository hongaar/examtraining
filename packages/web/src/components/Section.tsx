import React from "react";

type Props = {
  children: React.ReactNode;
  fluid?: boolean;
  className?: string;
};

export function Section({ children, fluid = false, className }: Props) {
  console.debug("Rendering component Section");

  return (
    <section
      className={`${fluid ? "container-fluid" : "container"} ${className || ""}`}
    >
      {children}
    </section>
  );
}
