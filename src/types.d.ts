declare module 'vault-sdk-dev';

declare global {
  interface Window {
    global: any;
    Buffer: any;
    process: any;
  }
}
