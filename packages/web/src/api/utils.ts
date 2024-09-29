import { toast } from "react-hot-toast";

export function progress<T>(promise: Promise<T>, msg: string) {
  return toast.promise(promise, {
    loading: msg,
    success: msg,
    error: "Something went wrong",
  });
}

export function parseDoc<T>(data: T | null | undefined) {
  if (typeof data === "undefined") {
    return undefined;
  }

  if (data === null) {
    return null;
  }

  Object.entries(data).forEach(([key, value]) => {
    if (
      typeof value === "object" &&
      value !== null &&
      value.constructor === Object &&
      value._time
    ) {
      data[key as keyof T] = new Date(value._time) as any;
    }
  });

  return data;
}
