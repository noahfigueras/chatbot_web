"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-border-cyan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                ChatBot<span className="text-neon-cyan">Pro</span>
              </span>
            </div>
            <p className="text-text-muted max-w-md leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("product")}</h4>
            <ul className="space-y-3">
              {["features", "pricing", "howItWorks"].map((key) => (
                <li key={key}>
                  <a href={`#${key === "howItWorks" ? "how-it-works" : key}`} className="text-text-muted hover:text-neon-cyan transition-colors text-sm">
                    {t(`productLinks.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("company")}</h4>
            <ul className="space-y-3">
              {["about", "contact", "privacy", "terms"].map((key) => (
                <li key={key}>
                  {key === "contact" ? (
                    <a href="mailto:hello@redfortlabs.xyz" className="text-text-muted hover:text-neon-cyan transition-colors text-sm">
                      {t(`companyLinks.${key}`)}
                    </a>
                  ) : (
                    <a href="#" className="text-text-muted hover:text-neon-cyan transition-colors text-sm">
                      {t(`companyLinks.${key}`)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-cyan mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-text-muted text-sm">
              {t("copyright", { year: new Date().getFullYear() })}
            </p>
            <span className="hidden sm:inline text-text-dim">·</span>
            <p className="text-text-muted text-sm">
              {t("builtBy")}{" "}
              <a
                href="https://redfortlabs.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:underline"
              >
                {t("parentCompany")}
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://redfortlabs.xyz/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-neon-cyan transition-colors text-sm"
            >
              {t("blog")}
            </a>
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a key={social} href="#" className="text-text-muted hover:text-neon-cyan transition-colors text-sm">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
