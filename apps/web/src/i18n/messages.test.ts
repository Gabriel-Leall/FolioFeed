import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, messages } from "./messages";

const englishRequiredKeys = [
  "brand.name",
  "header.auth.signIn",
  "landing.hero.cta.primary",
  "landing.footer.privacy",
  "modeToggle.sr",
] as const;

describe("i18n messages", () => {
  it("uses pt-BR as default locale", () => {
    expect(DEFAULT_LOCALE).toBe("pt-BR");
  });

  it("contains required english translations", () => {
    for (const key of englishRequiredKeys) {
      expect(messages.en[key]).toBeTypeOf("string");
      expect(messages.en[key].length).toBeGreaterThan(0);
    }
  });

  it("keeps brand name as FolioFeed in both locales", () => {
    expect(messages["pt-BR"]["brand.name"]).toBe("FolioFeed");
    expect(messages.en["brand.name"]).toBe("FolioFeed");
  });
});
