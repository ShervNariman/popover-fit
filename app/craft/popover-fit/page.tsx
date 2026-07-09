import type { Metadata } from "next";

import { PopoverFitDemo } from "@/components/demo/popover-fit-demo";

export const metadata: Metadata = {
  title: "popover-fit — Make popovers fit better",
  description:
    "A tiny CSS utility for shadcn/Radix popovers that matches the trigger width and keeps long menus inside the viewport.",
};

export default function PopoverFitCraftPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      <PopoverFitDemo />
    </div>
  );
}
