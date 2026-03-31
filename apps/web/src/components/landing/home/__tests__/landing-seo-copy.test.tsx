import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { metadata } from "@/app/page";
import { LandingHero } from "../landing-hero";

type LinkMockProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: LinkMockProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("landing contract", () => {
  it("defines strong home metadata", () => {
    const expectedTitle = "Comunidade curada para portfolios criativos";
    const expectedDescription =
      "Descubra portfolios criativos em uma comunidade curada e publique seu trabalho para ganhar reconhecimento.";
    const expectedOgDescription =
      "Vitrine editorial de portfolios criativos com foco em descoberta e reconhecimento.";
    const expectedTwitterDescription =
      "Explore artistas e publique seu portfolio em uma vitrine curada.";

    expect(metadata.title).toBe(expectedTitle);
    expect(String(metadata.title)).not.toMatch(/PeerFolio\s*\|\s*PeerFolio/i);
    expect(metadata.description).toBe(expectedDescription);
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph?.title).toBe(expectedTitle);
    expect(metadata.openGraph?.description).toBe(expectedOgDescription);
    expect(metadata.openGraph?.url).toBe("/");

    const twitter = metadata.twitter;
    if (!twitter || typeof twitter === "string") {
      throw new Error("Expected structured twitter metadata");
    }

    const twitterRecord = twitter as Record<string, unknown>;
    expect(twitterRecord.card).toBe("summary_large_image");
    expect(twitterRecord.title).toBe(expectedTitle);
    expect(twitterRecord.description).toBe(expectedTwitterDescription);
  });

  it("renders editorial hero with dual CTA contract", () => {
    render(<LandingHero />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      /Onde artistas digitais transformam portfolio em reconhecimento\./i,
    );

    expect(screen.getByRole("region", { name: h1.textContent ?? "" })).toBeInTheDocument();

    const ctaLinks = screen.getAllByRole("link");
    expect(ctaLinks).toHaveLength(2);
    expect(ctaLinks[0]).toHaveAccessibleName("Explorar artistas");
    expect(ctaLinks[0]).toHaveAttribute("href", "/feed");
    expect(ctaLinks[1]).toHaveAccessibleName("Publicar meu portfolio");
    expect(ctaLinks[1]).toHaveAttribute("href", "/submit");
  });
});
