import "@testing-library/jest-dom/vitest";

/** React Flow expects ResizeObserver in the browser. */
globalThis.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};
