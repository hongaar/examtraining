import { Delayed } from "./Delayed";

type Props = {
  children: React.ReactNode;
  delay?: number;
};

export function Loading({ children, delay }: Props) {
  console.debug("Rendering component Loading");

  return (
    <Delayed delay={delay}>
      <main className="container loading">
        <span aria-busy="true">{children}</span>
      </main>
    </Delayed>
  );
}
