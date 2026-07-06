"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    step: "01",
    title: "Upload Your Knowledge",
    desc: "Drop in your PDFs, website links, social media profiles, and booking pages. Our AI learns everything about your business.",
    color: "from-neon-cyan to-blue-500",
  },
  {
    step: "02",
    title: "Customize Your Bot",
    desc: "Set the tone, personality, colors, and avatar. Make it feel like a natural extension of your team.",
    color: "from-neon-purple to-neon-pink",
  },
  {
    step: "03",
    title: "Deploy & Go Live",
    desc: "Embed on your site with one line of code, or connect to Slack, WhatsApp, and more. Your AI team starts working instantly.",
    color: "from-neon-pink to-orange-500",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
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
    <div
      ref={ref}
      className="scroll-reveal"
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <div className="glass-card rounded-2xl p-8 sm:p-10 relative group hover:shadow-lg hover:shadow-neon-cyan/5 transition-all duration-500">
        <div className="flex items-start gap-6">
          <div
            className={`shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-2xl font-bold`}
          >
            {step.step}
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
            <p className="text-text-muted text-lg leading-relaxed">{step.desc}</p>
          </div>
        </div>

        {index < steps.length - 1 && (
          <div className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 z-10">
            <svg
              className="w-6 h-6 text-neon-cyan/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium">
            Simple Setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Get live in{" "}
            <span className="gradient-text">3 easy steps</span>
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            No coding, no complexity. Just pure AI-powered support.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
