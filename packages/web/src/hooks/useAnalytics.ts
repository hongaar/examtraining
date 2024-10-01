import { getAnalytics } from "firebase/analytics";
import { useMemo } from "react";
import { useFirebase } from "./useFirebase";

export function useAnalytics() {
  const firebase = useFirebase();

  const analytics = useMemo(() => {
    return getAnalytics(firebase.app);
  }, [firebase]);

  return analytics;
}
