"use client";

import { useAuth } from "@clerk/nextjs";
import { env } from "@PeerFolio/env/web";
import { Toaster } from "@PeerFolio/ui/components/sonner";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import { I18nProvider } from "@/i18n/provider";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </I18nProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
