import type { Id } from "@peerFolio/backend/convex/_generated/dataModel";
import type { Metadata } from "next";

import PortfolioDetailClient from "./PortfolioDetailClient";

type PortfolioDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Portfólio | FolioFeed`,
    description: "Veja e critique este portfólio no FolioFeed.",
    alternates: {
      canonical: `/portfolio/${id}`,
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { id } = await params;

  return <PortfolioDetailClient portfolioId={id as Id<"portfolios">} />;
}
