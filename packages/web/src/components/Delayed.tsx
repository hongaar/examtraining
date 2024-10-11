import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  delay?: number;
};

export function Delayed({ children, delay = 500 }: Props) {
  console.debug("Rendering component Delayed");

  const [isShown, setIsShown] = useState(delay === 0 ? true : false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isShown ? children : null;
}
