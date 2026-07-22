"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t("features"), href: "#features" },
    { label: t("howItWorks"), href: "#how-it-works" },
    { label: t("pricing"), href: "#pricing" },
    { label: t("blog"), href: "https://redfortlabs.xyz/blog", external: true },
  ];

  const branding = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-white">
          ChatBot<span className="text-neon-cyan">Pro</span>
        </span>
        <span className="text-xs text-text-dim hidden sm:inline">by Redfort Labs</span>
      </div>
    </div>
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border-cyan"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {isDashboard ? (
            <Link href="/dashboard">{branding}</Link>
          ) : (
            <Link href="/">{branding}</Link>
          )}

          {!isDashboard && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-text-muted hover:text-neon-cyan transition-colors duration-200 text-sm font-medium"
                >
                  {link.label}
                  {"external" in link && link.external && (
                    <svg className="inline-block w-3 h-3 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            {isDashboard ? (
              <Link
                href="/dashboard"
                className="text-text-muted hover:text-neon-cyan transition-colors duration-200 text-sm font-medium"
              >
                {t("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-text-muted hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white text-sm font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all duration-300"
                >
                  {t("signup")}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-muted hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && !isDashboard && (
        <div className="md:hidden bg-surface/95 backdrop-blur-xl border-t border-border-cyan">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...("external" in link && link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={() => setMobileOpen(false)}
                className="block text-text-muted hover:text-neon-cyan transition-colors py-2"
              >
                {link.label}
                {"external" in link && link.external && (
                  <svg className="inline-block w-3 h-3 ml-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </a>
            ))}
            <hr className="border-border-cyan" />
            <Link href="/login" className="block text-text-muted hover:text-white transition-colors py-2">
              {t("login")}
            </Link>
            <Link
              href="/signup"
              className="block text-center px-5 py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-semibold"
            >
              {t("signup")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
