"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Accessibility for modal dialogs. While `open`:
 *  - focus moves into the dialog (the first field, or the first control),
 *  - Tab and Shift+Tab cycle inside it instead of reaching the page behind,
 *  - Escape calls `onEscape`.
 * When it closes, focus returns to the element that had it before opening.
 */
export function useDialogFocus(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: {
    initialFocusRef?: RefObject<HTMLElement | null>;
    onEscape?: () => void;
  } = {},
) {
  const { initialFocusRef, onEscape } = options;

  // Read through a ref, so a new callback on each render does not re-run the
  // effect (which would move focus back into the dialog mid-typing).
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    (initialFocusRef?.current ?? focusables()[0] ?? container)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !container) return;

      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!first) {
        e.preventDefault();
        return;
      }
      const outside = !container.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, containerRef, initialFocusRef]);
}
