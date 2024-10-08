import { createContext, useEffect, useState } from "react";
import { FirebaseApp, loadFirebase } from "../api";
import { Loading } from "../components";

type Props = {
  children: React.ReactNode;
};

type Context = {
  app: FirebaseApp;
};

// WARNING: side-effect
export const firebasePromise = loadFirebase();

export const FirebaseContext = createContext<Context>(null as any);

export function FirebaseProvider({ children }: Props) {
  console.debug("Rendering context FirebaseProvider");

  const [value, setValue] = useState<Context>();

  useEffect(() => {
    firebasePromise.then(setValue);
  }, []);

  if (!value) {
    return <Loading>Loading examtraining.online...</Loading>;
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}
