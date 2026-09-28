"use client";

import { useEffect } from "react";

export const isAbortedViewTransition = (reason: unknown): boolean =>
  reason instanceof DOMException
  && reason.name === "InvalidStateError"
  && /transition/iu.test(reason.message);

export const ViewTransitionAbortGuard = () => {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isAbortedViewTransition(event.reason)) {
        event.preventDefault();
      }
    };

    globalThis.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      globalThis.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
};
