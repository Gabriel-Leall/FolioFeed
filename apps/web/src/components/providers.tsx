"use client";

import { useAuth } from "@clerk/nextjs";
import { env } from "@PeerFolio/env/web";
import { Toaster } from "@PeerFolio/ui/components/sonner";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./theme-provider";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </ConvexProviderWithClerk>
      <Toaster richColors />
    </ThemeProvider>
  );
}
