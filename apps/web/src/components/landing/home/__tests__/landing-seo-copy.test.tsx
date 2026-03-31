import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LandingHero } from "../landing-hero";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("landing contract", () => {
  it("exposes expected hero heading and ctas", () => {
    vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null);

    render(<LandingHero />);

    expect(
      screen.getByRole("heading", { name: /A Galeria Digital para/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Apply for Membership" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Explorar Arquivo" }),
    ).toBeInTheDocument();
  });
});
