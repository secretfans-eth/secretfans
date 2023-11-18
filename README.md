# Prove you're not a bot with your WorldID

Off-chain web backend verification.

## Usage

First, set the correct Node.js version using `nvm` and run the development server:

```bash
nvm use 18
pnpm i && pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This template includes an API route to verify the proof returned by the IDKit widget at `/api/verify`. Edit `src/pages/api/verify.ts` to handle any backend functions you need to perform.

The `src/pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.
