"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CTA() {
  const t = useTranslations("CTA");

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-neon-cyan/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium">
          {t("title")}
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
          {t("title")}
        </h2>

        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="group relative px-10 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-neon-cyan/25"
          >
            <span className="relative z-10">{t("cta")}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <a
            href="#pricing"
            className="px-10 py-4 rounded-xl border border-border-cyan hover:border-neon-cyan/50 text-white font-semibold text-lg transition-all duration-300"
          >
            View Pricing
          </a>
        </div>

        <p className="text-sm text-text-muted">
          No credit card required. Free forever plan available.
        </p>
      </div>
    </section>
  );
}
