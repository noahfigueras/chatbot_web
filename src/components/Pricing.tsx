"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function PricingCard({ name, price, period, desc, features, cta, popular, gradient, href, index }: {
  name: string; price: string; period: string; desc: string; features: string[]; cta: string; popular: boolean; gradient: string; href: string | null; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="scroll-reveal" style={{ transitionDelay: `${index * 150}ms` }}>
      <div className={`relative glass-card rounded-2xl p-8 h-full flex flex-col ${popular ? "border-neon-cyan/40 shadow-lg shadow-neon-cyan/10" : ""}`}>
        {popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple text-xs font-semibold text-white">
            Most Popular
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
          <p className="text-text-muted text-sm mb-4">{desc}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">{price}</span>
            {period && <span className="text-text-muted text-sm">{period}</span>}
          </div>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <svg className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-text-muted">{f}</span>
            </li>
          ))}
        </ul>

        {href ? (
          <a href={href} className="block text-center px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 border border-border-cyan text-white hover:border-neon-cyan/50">
            {cta}
          </a>
        ) : (
          <Link href="/signup" className="block text-center px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:shadow-lg hover:shadow-neon-cyan/25">
            {cta}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  const t = useTranslations("Pricing");

  const tiers = [
    {
      name: t("plans.free.name"), price: t("plans.free.price"), period: "",
      desc: t("plans.free.description"),
      features: t.raw("plans.free.features") as string[],
      cta: t("plans.free.cta"), popular: false,
      gradient: "from-neon-cyan to-blue-500", href: "/signup",
    },
    {
      name: t("plans.pro.name"), price: t("plans.pro.price"), period: "/mo",
      desc: t("plans.pro.description"),
      features: t.raw("plans.pro.features") as string[],
      cta: t("plans.pro.cta"), popular: true,
      gradient: "from-neon-purple to-neon-pink", href: null,
    },
    {
      name: t("plans.enterprise.name"), price: t("plans.enterprise.price"), period: "",
      desc: t("plans.enterprise.description"),
      features: t.raw("plans.enterprise.features") as string[],
      cta: t("plans.enterprise.cta"), popular: false,
      gradient: "from-neon-pink to-orange-500",
      href: "mailto:hello@redfortlabs.xyz?subject=Enterprise%20plan%20inquiry",
    },
  ];

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-sm font-medium">
            {t("title")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{t("title")}</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <PricingCard key={i} {...tier} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
