
// Ensure this is treated as a module
export {};

declare global {
  interface Window {
    global: any;
    Buffer: any;
    process: any;
  }
}

declare module 'vault-sdk-dev';
