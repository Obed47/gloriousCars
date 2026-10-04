import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Node-environment tests import this file too, so every browser global is guarded.
const inBrowser = typeof window !== "undefined";

// jsdom does not implement these browser APIs; the components use them.
class NoopIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

/** A complete in-memory Storage, used when the runtime's own one is unusable. */
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => Array.from(data.keys())[index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, String(value));
    },
  };
}

// Node 25 exposes a `localStorage` global without methods, which shadows jsdom's.
if (inBrowser && typeof window.localStorage?.getItem !== "function") {
  const storage = createMemoryStorage();
  for (const target of [window, globalThis]) {
    Object.defineProperty(target, "localStorage", { value: storage, configurable: true, writable: true });
  }
}

if (inBrowser) {
  globalThis.IntersectionObserver ??= NoopIntersectionObserver as unknown as typeof IntersectionObserver;

  if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }

  Element.prototype.scrollIntoView ??= function scrollIntoView() {};
}

afterEach(() => {
  if (inBrowser) {
    cleanup();
    window.localStorage.clear();
  }
  vi.restoreAllMocks();
});
