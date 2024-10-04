import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

type Preferences = {
  questionsCount?: number;
};

export function usePreferences() {
  const [preferences, setPreferences] = useLocalStorage<Preferences>(
    "preferences",
    {},
  );

  const setPreference = useCallback(
    <T extends keyof Preferences>(key: T, value: Preferences[T]) => {
      const newPreferences = {
        ...preferences,
        [key]: value,
      };

      setPreferences(newPreferences);
    },
    [preferences, setPreferences],
  );

  return { preferences, setPreference };
}
