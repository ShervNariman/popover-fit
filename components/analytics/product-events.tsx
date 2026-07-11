"use client";

import { useEffect } from "react";

type Client = { capture: (event: string, properties?: Record<string, unknown>) => void };

const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";

function capture(event: string, properties: Record<string, unknown> = {}) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_ENABLED === "false") return;
  try {
    const posthog = (window as Window & { posthog?: Client }).posthog;
    posthog?.capture(event, {
      product: "popover-fit",
      surface: "web",
      environment,
      route: window.location.pathname,
      ...properties,
    });
  } catch {
    // Analytics must never interrupt the demo.
  }
}

export function ProductEvents() {
  useEffect(() => {
    if (window.location.pathname === "/record" || window.location.pathname.startsWith("/record/")) return;
    const interacted = new Set<string>();

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest<HTMLButtonElement>("button");
      if (!button) return;

      if (/copy|copied/i.test(button.textContent ?? "")) {
        const block = button.closest(".overflow-hidden");
        const label = block?.querySelector("span")?.textContent?.trim().toLowerCase() ?? "unknown";
        capture("install_copied", { snippet: label });
        return;
      }

      if (button.getAttribute("role") === "switch") {
        capture("demo_interacted", {
          interaction: "width_guides_toggled",
          enabled_after_click: button.getAttribute("aria-checked") !== "true",
        });
        return;
      }

      if (button.getAttribute("role") === "combobox") {
        const card = button.closest<HTMLElement>("[class*='rounded-2xl']");
        const variant = card?.querySelector("h3")?.textContent?.trim().toLowerCase() ?? "unknown";
        const key = `popover:${variant}`;
        if (interacted.has(key)) return;
        interacted.add(key);
        capture("demo_interacted", { interaction: "popover_toggled", variant });
      }
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
