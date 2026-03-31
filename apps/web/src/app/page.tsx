import type { Metadata } from "next";

import { LandingPageShell } from "@/components/landing/home/landing-page-shell";

export const metadata: Metadata = {
  title: "Comunidade curada para portfolios criativos",
  description:
    "Descubra portfolios criativos em uma comunidade curada e publique seu trabalho para ganhar reconhecimento.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Comunidade curada para portfolios criativos",
    description:
      "Vitrine editorial de portfolios criativos com foco em descoberta e reconhecimento.",
    url: "/",
    siteName: "PeerFolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comunidade curada para portfolios criativos",
    description:
      "Explore artistas e publique seu portfolio em uma vitrine curada.",
  },
};

export default function HomePage() {
  return <LandingPageShell />;
}
