import React from "react";

type Props = {
  children: React.ReactNode;
  fluid?: boolean;
  className?: string;
};

export function Container({ children, fluid = false, className }: Props) {
  console.debug("Rendering component Section");

  return (
    <div
      className={`${fluid ? "container-fluid" : "container"} ${className || ""}`}
    >
      {children}
    </div>
  );
}
