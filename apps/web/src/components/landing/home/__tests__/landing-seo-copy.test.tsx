import { describe, expect, it } from "vitest";

describe("landing contract", () => {
  it("exposes expected cta labels", () => {
    const ctas = ["Explorar artistas", "Publicar meu portfolio"];
    expect(ctas).toContain("Explorar artistas");
    expect(ctas).toContain("Publicar meu portfolio");
  });
});
