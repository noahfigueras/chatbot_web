"use client";

import { useEffect, useRef } from "react";

const tiers = [
  {
    name: "Free",
    price: "€0",
    period: "",
    desc: "Perfect for testing the waters.",
    features: [
      "5 chatbots",
      "500 messages per bot / month",
      "10 MB knowledge storage",
      "WhatsApp + Telegram channels",
      "GPT-5.4-nano model",
    ],
    cta: "Get Started Free",
    popular: false,
    gradient: "from-neon-cyan to-blue-500",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "€50",
    period: "/mo",
    desc: "For growing businesses.",
    features: [
      "15 chatbots",
      "5,000 messages per bot / month",
      "100 MB knowledge storage",
      "WhatsApp + Telegram channels",
      "GPT-5.4-nano model",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    gradient: "from-neon-purple to-neon-pink",
    href: null,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For high-volume businesses.",
    features: [
      "Custom chatbot & message limits",
      "Custom knowledge storage",
      "Priority support",
      "Dedicated onboarding",
      "Custom integrations",
    ],
    cta: "Contact us",
    popular: false,
    gradient: "from-neon-pink to-orange-500",
    href: "mailto:hello@redfortlabs.xyz?subject=Enterprise%20plan%20inquiry",
  },
];

function PricingCard({ tier, index }: { tier: typeof tiers[0]; index: number }) {
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
    <div
      ref={ref}
      className="scroll-reveal"
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div
        className={`relative glass-card rounded-2xl p-8 h-full flex flex-col ${
          tier.popular ? "border-neon-cyan/40 shadow-lg shadow-neon-cyan/10" : ""
        }`}
      >
        {tier.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple text-xs font-semibold text-white">
            Most Popular
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
          <p className="text-text-muted text-sm mb-4">{tier.desc}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">{tier.price}</span>
            {tier.period && (
              <span className="text-text-muted text-sm">{tier.period}</span>
            )}
          </div>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <svg
                className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-text-muted">{f}</span>
            </li>
          ))}
        </ul>

        {tier.href ? (
          <a
            href={tier.href}
            className="block text-center px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 border border-border-cyan text-white hover:border-neon-cyan/50"
          >
            {tier.cta}
          </a>
        ) : (
          <a
            href="/signup"
            className="block text-center px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:shadow-lg hover:shadow-neon-cyan/25"
          >
            {tier.cta}
          </a>
        )}
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-sm font-medium">
            Simple Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Plans that{" "}
            <span className="gradient-text">scale with you</span>
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Start free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <PricingCard key={i} tier={tier} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
