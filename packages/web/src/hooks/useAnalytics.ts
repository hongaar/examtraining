import { EventParams, getAnalytics, logEvent } from "firebase/analytics";
import { useCallback, useMemo } from "react";
import { useFirebase } from "./useFirebase";

export function useAnalytics() {
  const firebase = useFirebase();

  const analytics = useMemo(() => {
    return getAnalytics(firebase.app);
  }, [firebase]);

  return analytics;
}

export function useLogEvent() {
  const analytics = useAnalytics();

  return useCallback(
    function (
      eventName: string,
      eventParams?: {
        content_type?: EventParams["content_type"];
        item_id?: EventParams["item_id"];
        [key: string]: any;
      },
    ) {
      logEvent(analytics, eventName, eventParams);
    },
    [analytics],
  );
}
