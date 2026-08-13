# LIVV

Clean Next.js foundation for the LIVV project.

**Stack**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — local development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Project Structure

```
src/
  app/           # App Router pages and layouts
  components/
    ui/          # Reusable UI primitives
  lib/           # Shared utilities
```

## Deploy

Ready for Vercel. Connect the repository and deploy.

Do not commit secrets. Use environment variables in Vercel for any sensitive values.
