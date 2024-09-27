import { useContext } from "react";
import { FirebaseContext } from "../context";

export function useFirebase() {
  return useContext(FirebaseContext);
}
