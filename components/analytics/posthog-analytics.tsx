"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface Props {
  product: string;
  excludeRoutes?: string[];
}

type Client = { capture: (event: string, properties?: Record<string, unknown>) => void };

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/$/, "");
const enabled = Boolean(token) && process.env.NEXT_PUBLIC_POSTHOG_ENABLED !== "false";
const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";

function client(): Client | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { posthog?: Client }).posthog;
}

function RouteTracker({ product, excludeRoutes = [] }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || !pathname || excludeRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return;
    const properties = { product, surface: "web", environment, route: pathname };
    const capture = () => {
      const posthog = client();
      if (!posthog) return false;
      posthog.capture("$pageview", { ...properties, $current_url: window.location.href });
      posthog.capture("product_viewed", properties);
      return true;
    };
    if (capture()) return;
    const ready = () => capture();
    window.addEventListener("posthog:ready", ready, { once: true });
    const fallback = window.setTimeout(capture, 2000);
    return () => {
      window.removeEventListener("posthog:ready", ready);
      window.clearTimeout(fallback);
    };
  }, [excludeRoutes, pathname, product]);

  return null;
}

export function PostHogAnalytics({ product, excludeRoutes = [] }: Props) {
  if (!enabled || !token) return null;
  const bootstrap = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister getFeatureFlag isFeatureEnabled onFeatureFlags identify group reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing startSessionRecording stopSessionRecording captureException".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init(${JSON.stringify(token)}, { api_host: ${JSON.stringify(host)}, defaults: "2026-05-30", autocapture: true, capture_pageview: false, capture_pageleave: true, person_profiles: "identified_only", session_recording: { maskAllInputs: true }, loaded: function(){ window.dispatchEvent(new Event("posthog:ready")); } });
  `;
  return <><Script id="posthog-bootstrap" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: bootstrap }} /><RouteTracker product={product} excludeRoutes={excludeRoutes} /></>;
}
