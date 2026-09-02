"use client";

import { Menu } from "lucide-react";

import { UserMenu } from "@/components/user-menu";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>
      <div className="flex-1" />
      <UserMenu />
    </header>
  );
}
