# popover-fit

A tiny **CSS-only** utility for better-fitting [shadcn](https://ui.shadcn.com)/[Radix](https://www.radix-ui.com) popovers.

It matches the popover width to the trigger and keeps long menus inside the viewport — no JavaScript runtime, no config, no dependencies.

## The utility

```css
.popover-fit {
  width: var(--radix-popover-trigger-width);
  max-height: var(--radix-popover-content-available-height);
  overflow-y: auto;
}
```

Radix already exposes these CSS custom properties on `PopoverContent`. `popover-fit` just uses them.

Source: [`registry/popover-fit/popover-fit.css`](./registry/popover-fit/popover-fit.css)

## Usage

Import the CSS once, then add the class:

```tsx
import "@/registry/popover-fit/popover-fit.css";

<PopoverContent className="popover-fit">
  {/* your filter, combobox, or menu content */}
</PopoverContent>
```

That gives you:

1. Popover width matched to the trigger
2. Max height constrained to available viewport height
3. Vertical scrolling when content overflows

## Good to know

- Designed for Radix/shadcn `PopoverContent` — it relies on Radix’s own CSS custom properties.
- Best when Radix CSS variables are available (Popover, DropdownMenu, Select, combobox-style primitives).
- Not a replacement for accessible popover behavior — focus management, keyboard navigation, and ARIA still come from Radix.

## Local development

This repo includes a before/after demo (Next.js + Tailwind + shadcn):

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (also at `/craft/popover-fit`).

```bash
pnpm build   # production build
pnpm lint    # eslint
```

## Project structure

```
registry/popover-fit/popover-fit.css   the CSS utility
components/demo/popover-fit-demo.tsx   interactive before/after demo
app/page.tsx                           landing page
app/craft/popover-fit/page.tsx         demo route
```

## License

MIT © 2026 Sherv Nariman
