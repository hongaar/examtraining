import { Delayed } from "./Delayed";

type Props = {
  children: React.ReactNode;
};

export function Loading({ children }: Props) {
  console.debug("Rendering component Loading");

  return (
    <Delayed delay={0}>
      <main className="container">
        <span aria-busy="true">{children}</span>
      </main>
    </Delayed>
  );
}
