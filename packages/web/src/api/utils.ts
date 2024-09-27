import { format } from "date-fns";
import { toast } from "react-hot-toast";

export function progress<T>(promise: Promise<T>, msg: string) {
  return toast.promise(promise, {
    loading: msg,
    success: msg,
    error: "Something went wrong",
  });
}

export function dateFormat(date: Date) {
  const formatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;
  return new Intl.DateTimeFormat("nl", formatOptions).format(date);
}

export function daterangeFormat(date1: Date, date2: Date) {
  const formatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;
  return new Intl.DateTimeFormat("nl", formatOptions).formatRange(date1, date2);
}

export function formatIso(date: Date) {
  return format(date, "yyyy-MM-dd");
}
