import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { useCallback, useEffect, useMemo, useState } from "react";
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
    async (data?: FunctionParams<FunctionTypes[typeof fn]>) => {
      // return type : Promise<FunctionReturn<FunctionTypes[typeof fn]> | undefined>
      const callable = httpsCallable<
        FunctionParams<FunctionTypes[typeof fn]>,
        FunctionReturn<FunctionTypes[typeof fn]>
      >(functions, fn);

      return (await callable(data)).data;
    },
    [functions, fn],
  );

  return call;
}

export function useFunctionResult<F extends Functions>(
  fn: F,
  args: FunctionParams<FunctionTypes[F]>,
) {
  const call = useFunction(fn);
  const [result, setResult] = useState<
    FunctionReturn<FunctionTypes[F]> | undefined
  >(undefined);

  useEffect(() => {
    call(args).then((result) => {
      setResult(result);
    });
  }, [args, call]);

  return result;
}
