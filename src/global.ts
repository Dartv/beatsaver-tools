export {};

declare global {
  interface Window {
    saveAs: (blob: Blob, filename: string) => void;
    GM_getResourceURL: (name: string) => string | undefined;
  }
}
