# Vault SDK Tester

This is a React frontend to test the `vault-sdk` features.

## Setup

1. Ensure `../Vault-sdk` is available.
2. Install dependencies:
   ```bash
   npm install
   ```

## Running

Start the development server:

```bash
npm run dev
```

## Features

- **Configuration**: Set your API Keys and Base URL.
- **File Browser**:
  - List files.
  - Create folders.
  - Upload files (handled as `uploadFiles` batch).
  - Delete, Rename, Star files.
- **Storage & Plans**:
  - View storage usage.
  - List available plans.
  - Buy plans.
  - View active subscriptions.
- **Logs**: Real-time logs of SDK method calls and responses.

## Troubleshooting

If you encounter issues with `vault-sdk` imports (Node.js modules), check `vite.config.ts`.
We use `vite-plugin-node-polyfills` and custom shims for `ws` and `dotenv`.
