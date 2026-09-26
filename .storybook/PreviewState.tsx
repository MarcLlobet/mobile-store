import { useEffect, useRef, type ReactNode } from "react";

export type PreviewStateName = "default" | "hover" | "active";

export const PREVIEW_STATES: PreviewStateName[] = ["default", "hover", "active"];

export interface PreviewStateProps {
  state: PreviewStateName;
  selector?: string;
  children: ReactNode;
}

export const PreviewState = ({ state, selector, children }: PreviewStateProps) => {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    const target = selector === undefined ? root.firstElementChild : root.querySelector(selector);
    if (!(target instanceof HTMLElement)) return;
    if (state === "default") {
      delete target.dataset.previewState;
    } else {
      target.dataset.previewState = state;
    }
  });

  return (
    <div ref={host} style={{ display: "contents" }}>
      {children}
    </div>
  );
};
