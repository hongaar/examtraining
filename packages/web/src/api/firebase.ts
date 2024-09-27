import { initializeApp } from "firebase/app";
export type { FirebaseApp } from "firebase/app";

let INIT_URL = "/__/firebase/init.json";

export async function loadFirebase() {
  // @ts-ignore
  if (typeof window.firebase !== "undefined") {
    // Already initialized, skip
    throw new Error("Firebase already initialized, this is weird...");
  }

  const initResponse = await (await fetch(INIT_URL)).json();

  // @ts-ignore
  window.firebase = true;

  const app = initializeApp(initResponse);
  console.debug("Firebase SDK loaded");

  return { app };
}
