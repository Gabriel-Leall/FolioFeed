import { cleanup, render, screen } from "@testing-library/react";
import type {
  AnchorHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { metadata } from "@/app/page";
import { CulturalSpotlight } from "@/components/landing/cultural-spotlight";
import { CtaSection } from "../cta-section";
import { FeaturesSection } from "../features-section";
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

vi.mock("next/image", () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    src,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    alt: string;
    src: string | { src: string };
    fill?: boolean;
    priority?: boolean;
  }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : src.src} {...props} />,
}));

const mockUsePaginatedQuery = vi.fn();

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("convex/react", () => ({
  usePaginatedQuery: (...args: unknown[]) => mockUsePaginatedQuery(...args),
}));

vi.mock("@PeerFolio/backend/convex/_generated/api", () => ({
  api: {
    portfolios: {
      queries: {
        list: "mocked-query",
      },
    },
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  mockUsePaginatedQuery.mockReturnValue({
    results: [],
    status: "CanLoadMore",
  });
});

const fallbackImage =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop";

const ctaContracts = [
  { name: "Explorar artistas", href: "/feed" },
  { name: "Publicar meu portfolio", href: "/submit" },
];

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

    expect(screen.getAllByRole("link")).toHaveLength(ctaContracts.length);

    ctaContracts.forEach(({ name, href }) => {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    });
  });

  it("renders community showcase heading copy contract", () => {
    render(<CulturalSpotlight />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /Vitrine da comunidade/i,
    );
  });

  it("renders features section hierarchy with editorial copy", () => {
    render(<FeaturesSection />);

    expect(screen.getByRole("heading", { level: 2, name: "Por que PeerFolio" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Por que PeerFolio" })).toBeInTheDocument();

    const cardHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(cardHeadings).toHaveLength(3);
    expect(cardHeadings[0]).toHaveTextContent(/curadoria editorial/i);
    expect(cardHeadings[1]).toHaveTextContent(/curadoria especializada/i);
    expect(cardHeadings[2]).toHaveTextContent(/reconhecimento que circula/i);
  });

  it("renders final editorial CTA with dual links contract", () => {
    render(<CtaSection />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /Seu portfolio merece contexto editorial e alcance real\./i,
    );

    expect(screen.getAllByRole("link")).toHaveLength(ctaContracts.length);

    ctaContracts.forEach(({ name, href }) => {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    });
  });

  it("announces loading state for screen readers", () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "LoadingFirstPage",
    });

    render(<CulturalSpotlight />);

    const status = screen.getByText(/Carregando vitrine/i).closest('[role="status"]');
    expect(status).not.toBeNull();
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(/Carregando vitrine/i);
  });

  it("announces empty state for screen readers", () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "CanLoadMore",
    });

    render(<CulturalSpotlight />);

    const status = screen
      .getByText(/Ainda nao ha portfolios em destaque/i)
      .closest('[role="status"]');
    expect(status).not.toBeNull();
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(/Ainda nao ha portfolios em destaque/i);
  });

  it("falls back to safe image for disallowed preview host", () => {
    mockUsePaginatedQuery.mockReturnValue({
      status: "CanLoadMore",
      results: [
        {
          _id: "portfolio-1",
          title: "Portfolio seguro",
          area: "Ilustracao",
          previewImageUrl: "https://evil.example.com/malicious.jpg",
          author: { nickname: "Artista" },
        },
      ],
    });

    render(<CulturalSpotlight />);

    const image = screen.getByRole("img", { name: "Portfolio seguro" });
    expect(image).toHaveAttribute("src", fallbackImage);
  });

  it("keeps allowed preview host image", () => {
    const allowedUrl =
      "https://images.unsplash.com/photo-1459908676235-d5f02a50184b?q=80&w=1200&auto=format&fit=crop";

    mockUsePaginatedQuery.mockReturnValue({
      status: "CanLoadMore",
      results: [
        {
          _id: "portfolio-2",
          title: "Portfolio permitido",
          area: "Fotografia",
          previewImageUrl: allowedUrl,
          author: { nickname: "Fotografo" },
        },
      ],
    });

    render(<CulturalSpotlight />);

    const image = screen.getByRole("img", { name: "Portfolio permitido" });
    expect(image).toHaveAttribute("src", allowedUrl);
  });
});
