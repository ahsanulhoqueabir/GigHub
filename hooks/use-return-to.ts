"use client";

import { useSearchParams } from "next/navigation";

export function useReturnTo(defaultUrl: string = "/") {
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || defaultUrl;

  const withReturnTo = (url: string) => {
    if (typeof window === "undefined") return url;
    const current = window.location.pathname + window.location.search;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}returnTo=${encodeURIComponent(current)}`;
  };

  return {
    returnTo,
    withReturnTo,
  };
}
