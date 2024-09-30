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

export function shuffle<T>(array: T[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

    // swap elements newArray[i] and newArray[j]
    // we use "destructuring assignment" syntax to achieve that
    // you'll find more details about that syntax in later chapters
    // same can be written as:
    // let t = newArray[i]; newArray[i] = newArray[j]; newArray[j] = t
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
