import { useEffect } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useSearch } from "wouter";

export function useSearchParams() {
  const searchString = useSearch();

  return new URLSearchParams(searchString);
}

export function useSearchParam(param: string) {
  const params = useSearchParams();

  return params.get(param) || undefined;
}

export function useAccessCode() {
  const [accessCode, setAccessCode] = useSessionStorage<string | undefined>(
    "accessCode",
    undefined,
  );
  const accessCodeFromSearchParams = useSearchParam("accessCode");

  useEffect(() => {
    if (accessCodeFromSearchParams) {
      setAccessCode(accessCodeFromSearchParams);
    }
  }, [accessCodeFromSearchParams, setAccessCode]);

  return accessCodeFromSearchParams || accessCode;
}

export function useEditCode() {
  const [editCode, setEditCode] = useSessionStorage<string | undefined>(
    "editCode",
    undefined,
  );
  const editCodeFromSearchParams = useSearchParam("editCode");

  useEffect(() => {
    if (editCodeFromSearchParams) {
      setEditCode(editCodeFromSearchParams);
    }
  }, [editCodeFromSearchParams, setEditCode]);

  return editCodeFromSearchParams || editCode;
}
