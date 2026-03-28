"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
} from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Dropdown>
      <DropdownTrigger
        aria-label="Toggle theme"
        className="size-9 rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </DropdownTrigger>
      <DropdownPopover placement="bottom end" className="w-36">
        <DropdownMenu
          aria-label="Tema"
          className="w-36 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-md"
          onAction={(key) => setTheme(key as string)}
        >
          <DropdownItem key="light" className="px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors outline-none cursor-pointer">
            Light
          </DropdownItem>
          <DropdownItem key="dark" className="px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors outline-none cursor-pointer">
            Dark
          </DropdownItem>
          <DropdownItem key="system" className="px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors outline-none cursor-pointer">
            System
          </DropdownItem>
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );
}
