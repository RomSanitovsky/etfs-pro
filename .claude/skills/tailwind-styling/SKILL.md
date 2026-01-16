---
name: tailwind-styling
description: Tailwind CSS 4 styling expertise for responsive design and component styling. Use when creating or updating component styles, layouts, or responsive designs.
---

# Tailwind CSS 4 Styling

## Responsive Design

Mobile-first breakpoints:
- `sm:` (640px+)
- `md:` (768px+)
- `lg:` (1024px+)
- `xl:` (1280px+)
- `2xl:` (1536px+)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Dark Mode

Use `dark:` prefix for dark mode styles:
```tsx
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
```

## Common Patterns

**Centering:**
```tsx
<div className="flex items-center justify-center">
```

**Card layout:**
```tsx
<div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
```

**Button:**
```tsx
<button className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
```

## Spacing Scale

Use Tailwind's spacing scale consistently:
- `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- `p-4`, `p-6`, `p-8` for padding
- `m-4`, `m-6`, `m-8` for margin

## Best Practices

- Use semantic color names from the design system
- Prefer flexbox (`flex`) for 1D layouts, grid (`grid`) for 2D
- Use `space-y-*` or `gap-*` instead of margin on children
- Keep class lists organized: layout > spacing > sizing > typography > colors > effects
