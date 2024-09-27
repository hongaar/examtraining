import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions";
import { useCallback, useMemo } from "react";
import {
  FunctionParams,
  FunctionReturn,
  Functions,
  FunctionTypes,
} from "../api";
import { useFirebase } from "./useFirebase";

const USE_EMULATOR = true;

function useFunctions() {
  const firebase = useFirebase();
  const functions = useMemo(() => {
    const functions = getFunctions(firebase.app, "europe-west1");

    if (USE_EMULATOR && process.env.NODE_ENV === "development") {
      try {
        connectFunctionsEmulator(functions, "localhost", 5001);
      } catch {}
    }

    return functions;
  }, [firebase]);

  return functions;
}

export function useFunction<F extends Functions>(fn: F) {
  const functions = useFunctions();
  const call = useCallback(
    async (
      data?: FunctionParams<FunctionTypes[typeof fn]>,
    ): Promise<
      HttpsCallableResult<FunctionReturn<FunctionTypes[typeof fn]>> | undefined
    > => {
      const callable = httpsCallable<
        FunctionParams<FunctionTypes[typeof fn]>,
        FunctionReturn<FunctionTypes[typeof fn]>
      >(functions, fn);

      return callable(data);
    },
    [functions, fn],
  );

  return call;
}
