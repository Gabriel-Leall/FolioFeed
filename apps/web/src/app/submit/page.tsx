import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, messages } from "@/i18n/messages";

export const metadata = {
  title: "Submeter Portfolio | FolioFeed",
  description: "Submeta seu portfolio para receber criticas da comunidade.",
};

export default async function SubmitPage() {
  const { userId } = await auth();
  const t = (key: string) => messages[DEFAULT_LOCALE][key] ?? key;

  if (!userId) {
    redirect("/sign-in?redirect=/submit" as any);
  }

  // SubmitPortfolioForm is a client component that handles the form logic
  // including nickname check redirect to /setup-profile
  const { default: SubmitPortfolioForm } = await import("./SubmitPortfolioForm");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold md:text-3xl">{t("submit.page.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("submit.page.description")}
        </p>
      </header>

      <SubmitPortfolioForm />
    </main>
  );
}
