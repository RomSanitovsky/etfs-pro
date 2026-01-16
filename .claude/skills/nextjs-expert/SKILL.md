---
name: nextjs-expert
description: Expert guidance on Next.js 16 App Router, Server Components, API routes, and performance optimization. Use when building features, optimizing performance, or working with server/client components.
---

# Next.js 16 Expert

## Architecture

- **App Router** with `app/` directory structure
- **React Server Components** by default (no 'use client' needed)
- **TypeScript** with strict mode

## Routing

- `page.tsx` defines a route segment
- `layout.tsx` wraps children and persists across navigation
- `loading.tsx` for Suspense loading UI
- `error.tsx` for error boundaries
- `not-found.tsx` for 404 pages

## Server vs Client Components

**Server Components** (default):
- Can fetch data directly with async/await
- Cannot use hooks, browser APIs, or event handlers
- Reduce client bundle size

**Client Components** (add `'use client'` at top):
- Required for: useState, useEffect, onClick, onChange, etc.
- Keep them small and push them down the tree

## Data Fetching

```tsx
// Server Component - fetch directly
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{/* render data */}</div>;
}
```

## Best Practices

- Fetch data in Server Components, pass to Client Components as props
- Use `loading.tsx` for streaming UI
- Colocate data fetching with components that use it
- Use `generateStaticParams` for static generation of dynamic routes
- Prefer Server Actions for mutations over API routes
