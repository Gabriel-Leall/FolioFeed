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
    expect(metadata.title).toBeTruthy();
    expect(String(metadata.description)).toContain("comunidade");
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph?.title).toBeTruthy();
    expect(metadata.twitter?.card).toBe("summary_large_image");
  });

  it("exposes expected hero heading and ctas", () => {
    vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null);

    render(<LandingHero />);

    expect(
      screen.getByRole("heading", { name: /A Galeria Digital para/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apply for Membership" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(screen.getByRole("link", { name: "Explorar Arquivo" })).toHaveAttribute(
      "href",
      "/feed",
    );
  });
});
