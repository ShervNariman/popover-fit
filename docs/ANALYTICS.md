# popover-fit analytics

## Activation

A visitor activates when they interact with either popover, toggle the width guides, or copy an implementation snippet.

## Events

- `product_viewed`
- `demo_interacted` with a safe interaction and variant
- `install_copied` with the snippet label only

Dedicated `/record` routes are excluded so launch recording sessions do not inflate product usage. The integration is inert without a token, masks all form inputs, and does not identify anonymous visitors.

## Vercel variables

```bash
NEXT_PUBLIC_POSTHOG_ENABLED=true
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Validate

1. Confirm the site builds with analytics disabled.
2. Add variables to a Vercel preview.
3. Confirm `product_viewed` in Live Events.
4. Toggle the guides and interact with each popover.
5. Copy CSS or usage code and verify only the label is captured.
6. Open `/record/popover-fit` and verify no activation events are emitted.
7. Create a funnel from `product_viewed` to `demo_interacted` or `install_copied`.