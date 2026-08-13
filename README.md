# LIVV

Personal evolution ecosystem.

**Stack**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

## Current Status (V1 Visual Foundation)

- Opening / loading experience
- Multi-step onboarding
- Conceptual home shell with primary areas
- Mobile bottom navigation
- Strong dark premium visual identity

No authentication, database, payments, or real backend systems yet.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx              # Opening experience
    onboarding/           # Onboarding flow
    home/                 # Main app shell + sections
  components/
    ui/                   # Reusable primitives
    layout/               # Navigation & shells
  lib/
    utils.ts
```

## Deploy

Ready for Vercel. Connect the repository and deploy.
