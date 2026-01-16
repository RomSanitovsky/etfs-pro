# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands should be run from the `etfs-pro-client` directory:

```bash
cd etfs-pro-client

npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Tech Stack

- **Next.js 16** with App Router (`app/` directory)
- **React 19** with Server Components by default
- **TypeScript** with strict mode enabled
- **Tailwind CSS 4** via PostCSS
- **ESLint 9** with next/core-web-vitals and next/typescript configs

## Architecture

- `app/` - App Router pages and layouts. Files named `page.tsx` are routes, `layout.tsx` wraps children.
- `@/*` path alias maps to the root of etfs-pro-client (configured in tsconfig.json)
