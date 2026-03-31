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
    vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null);

    render(<LandingHero />);

    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(
      /Onde artistas digitais transformam portfolio em reconhecimento\./i,
    );
    expect(screen.getByRole("link", { name: /explorar artistas/i })).toHaveAttribute(
      "href",
      "/feed",
    );
    expect(screen.getByRole("link", { name: /publicar meu portfolio/i })).toHaveAttribute(
      "href",
      "/submit",
    );
  });
});
