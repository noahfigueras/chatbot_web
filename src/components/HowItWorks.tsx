"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

function StepCard({ step, title, desc, color, index }: { step: string; title: string; desc: string; color: string; index: number }) {
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
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="scroll-reveal" style={{ transitionDelay: `${index * 200}ms` }}>
      <div className="glass-card rounded-2xl p-8 sm:p-10 relative group hover:shadow-lg hover:shadow-neon-cyan/5 transition-all duration-500">
        <div className="flex items-start gap-6">
          <div className={`shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-2xl font-bold`}>
            {step}
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="text-text-muted text-lg leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");

  const steps = [
    { step: t("steps.create.step"), title: t("steps.create.title"), desc: t("steps.create.desc"), color: "from-neon-cyan to-blue-500" },
    { step: t("steps.train.step"), title: t("steps.train.title"), desc: t("steps.train.desc"), color: "from-neon-purple to-neon-pink" },
    { step: t("steps.deploy.step"), title: t("steps.deploy.title"), desc: t("steps.deploy.desc"), color: "from-neon-pink to-orange-500" },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium">
            {t("title")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t("title")}
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((s, i) => (
            <StepCard key={i} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
