"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import "@/registry/popover-fit/popover-fit.css";

const STATUS_OPTIONS = [
  "Backlog",
  "Todo",
  "In Progress",
  "Done",
  "Blocked",
  "Cancelled",
  "Needs Review",
  "Deferred",
];

const CORE_CSS = `.popover-fit {
  width: var(--radix-popover-trigger-width);
  max-height: var(--radix-popover-content-available-height);
  overflow-y: auto;
}`;

const USAGE_SNIPPET = `<PopoverContent className="popover-fit">
  {/* your filter, combobox, or menu content */}
</PopoverContent>`;

/**
 * Tracks an element's rendered width so the width guides can display live,
 * accurate pixel values. Uses a callback ref so it re-attaches correctly
 * when Radix mounts/unmounts the (portaled) popover content.
 */
function useElementWidth<T extends HTMLElement>() {
  const [node, setNode] = React.useState<T | null>(null);
  const [width, setWidth] = React.useState<number | null>(null);

  const ref = React.useCallback((el: T | null) => {
    setNode(el);
  }, []);

  React.useEffect(() => {
    if (!node) {
      setWidth(null);
      return;
    }

    const update = () => setWidth(Math.round(node.getBoundingClientRect().width));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [ref, width] as const;
}

function StatusPill({
  tone,
  children,
}: {
  tone: "mismatch" | "fit";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "mismatch"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "mismatch" ? "bg-red-500" : "bg-emerald-500",
        )}
      />
      {children}
    </span>
  );
}

function GuideSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-foreground" : "bg-input",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform duration-150 ease-in-out",
          checked && "translate-x-[18px]",
        )}
      />
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — nothing to fall back to, fail quietly.
    }
  }, [code]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5">
        <span className="font-mono text-xs text-neutral-500">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed">
        <code className="font-mono text-neutral-900">{code}</code>
      </pre>
    </div>
  );
}

function DemoCard({
  heading,
  description,
  tone,
  applyFit,
  showGuides,
  toolbarRef,
}: {
  heading: string;
  description: string;
  tone: "mismatch" | "fit";
  applyFit: boolean;
  showGuides: boolean;
  toolbarRef: React.RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = React.useState(true);
  const [triggerRef, triggerWidth] = useElementWidth<HTMLButtonElement>();
  const [contentRef, contentWidth] = useElementWidth<HTMLDivElement>();

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">{heading}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <StatusPill tone={tone}>{tone === "mismatch" ? "Width mismatch" : "Fits trigger"}</StatusPill>
      </div>

      {/* Extra bottom padding keeps the open menu visually inside the stage
          instead of spilling into the code section below. */}
      <div className="flex flex-1 flex-col items-center justify-start rounded-xl border border-dashed border-border bg-muted/40 px-6 pb-72 pt-10">
        {/* Sits above the trigger — a popover only ever opens below it here,
            so this can never end up hidden behind an open menu. */}
        {showGuides && (
          <div className="mb-3 flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">
              trigger {triggerWidth ?? "–"}px ·{" "}
              <span
                className={cn(
                  "font-semibold",
                  tone === "mismatch"
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {tone === "mismatch" ? "mismatch" : "match"}
              </span>
            </span>
            <span
              className="h-1 rounded-full bg-foreground/25"
              style={{ width: triggerWidth ?? 0 }}
            />
          </div>
        )}

        <div className="relative flex flex-col items-center">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={triggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-64 justify-between bg-background font-normal"
              >
                Status
                <ChevronsUpDown className="size-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              ref={contentRef}
              align="start"
              sideOffset={36}
              // Toggling "Show width guides" shouldn't dismiss an open popover —
              // only treat clicks outside the toolbar as a real dismissal.
              onInteractOutside={(event) => {
                if (toolbarRef.current?.contains(event.target as Node)) {
                  event.preventDefault();
                }
              }}
              className={cn("p-1.5", applyFit && "popover-fit")}
            >
              <div className="flex flex-col">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm text-popover-foreground transition-colors duration-100 hover:bg-accent hover:text-accent-foreground"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Outside the popover so overflow-y:auto from .popover-fit can never
              clip it, and outside the auto-sized content so it can't inflate width. */}
          {showGuides && open && (
            <div
              className="pointer-events-none absolute left-1/2 top-full z-[60] mt-1.5 -translate-x-1/2"
              aria-hidden
            >
              <span
                className={cn(
                  "inline-flex min-w-[3.25rem] justify-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums shadow-sm",
                  tone === "mismatch"
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950 dark:text-red-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-400",
                )}
              >
                {contentWidth ?? "–"}px
              </span>
            </div>
          )}
        </div>
      </div>

      {!applyFit ? (
        <p className="text-xs text-muted-foreground">
          Content width is left to the browser, so it shrinks to fit the menu text instead of the
          trigger.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Stays inside the viewport, too — try resizing the window or opening this near the bottom
          of the page.
        </p>
      )}
    </div>
  );
}

export function PopoverFitDemo() {
  const [showGuides, setShowGuides] = React.useState(false);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
            <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
              <rect x="1" y="1" width="14" height="7.5" rx="1.5" fill="currentColor" />
              <rect x="3.5" y="10.5" width="9" height="4" rx="1" stroke="currentColor" fill="none" />
            </svg>
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            popover-fit
          </span>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          for shadcn &amp; Radix Popover
        </span>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 pb-14 pt-16 text-center sm:pt-20">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline">CSS only</Badge>
          <Badge variant="outline">Zero JS runtime</Badge>
          <Badge variant="outline">3 lines</Badge>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          Make popovers fit better.
        </h1>
        <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          A tiny CSS utility for shadcn/Radix popovers that matches the trigger width and keeps
          long menus inside the viewport.
        </p>
      </section>

      {/* Guides toggle */}
      <div
        ref={toolbarRef}
        className="mx-6 mb-5 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 sm:mx-8"
      >
        <div>
          <p className="text-sm font-medium text-foreground">Show width guides</p>
          <p className="text-xs text-muted-foreground">
            Overlay live pixel measurements for the trigger and each popover.
          </p>
        </div>
        <GuideSwitch checked={showGuides} onCheckedChange={setShowGuides} />
      </div>

      {/* Demo cards — generous bottom padding so open menus clear the code section. */}
      <section className="grid gap-5 px-6 pb-28 sm:px-8 md:grid-cols-2">
        <DemoCard
          heading="Without popover-fit"
          description="Default PopoverContent width."
          tone="mismatch"
          applyFit={false}
          showGuides={showGuides}
          toolbarRef={toolbarRef}
        />
        <DemoCard
          heading="With popover-fit"
          description={'className="popover-fit"'}
          tone="fit"
          applyFit={true}
          showGuides={showGuides}
          toolbarRef={toolbarRef}
        />
      </section>

      {/* Code */}
      <section id="code" className="mx-auto w-full max-w-2xl px-6 pb-14 pt-4 sm:px-8">
        <div className="mb-5 text-center">
          <h2 className="text-xl font-semibold text-foreground">The entire utility</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No config, no JavaScript, no dependencies.
          </p>
        </div>
        <CodeBlock code={CORE_CSS} label="popover-fit.css" />
      </section>

      {/* Usage */}
      <section className="mx-auto w-full max-w-2xl px-6 pb-14 sm:px-8">
        <div className="mb-5 text-center">
          <h2 className="text-xl font-semibold text-foreground">Usage</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Import the CSS once, then add the class to any Radix/shadcn PopoverContent.
          </p>
        </div>
        <CodeBlock code={USAGE_SNIPPET} label="your-component.tsx" />
      </section>

      {/* Honest copy */}
      <section className="mx-auto w-full max-w-2xl px-6 pb-20 sm:px-8">
        <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-foreground">Good to know</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              Designed for Radix/shadcn{" "}
              <code className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-[13px]">
                PopoverContent
              </code>{" "}
              — it reads Radix&apos;s own CSS custom properties.
            </li>
            <li>
              Best when Radix&apos;s CSS variables are available — Popover, DropdownMenu, Select,
              and combobox-style primitives all expose them.
            </li>
            <li>
              It is not a replacement for accessible popover behavior — focus management,
              keyboard navigation, and ARIA still come from Radix itself.
            </li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground sm:px-8">
        popover-fit is an open-source utility. Not affiliated with shadcn or WorkOS.
      </footer>
    </div>
  );
}
