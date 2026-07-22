import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

const localeMeta: Record<string, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "ChatBot Pro — Create AI Chatbots for WhatsApp & Telegram | Free",
    description:
      "Train a custom AI chatbot from your files and links. Deploy to WhatsApp, Telegram, Slack, and your website — free, no credit card required.",
    ogLocale: "en_US",
  },
  es: {
    title: "ChatBot Pro — Crea Chatbots IA para WhatsApp y Telegram | Gratis",
    description:
      "Entrena un chatbot IA personalizado con tus archivos y enlaces. Despliega en WhatsApp, Telegram, Slack y tu web — gratis, sin tarjeta de crédito.",
    ogLocale: "es_ES",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMeta[locale] || localeMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: meta.ogLocale,
      url: "https://chatbots.redfortlabs.xyz",
      siteName: "ChatBot Pro",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "ChatBot Pro — AI Chatbot Builder",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: "https://chatbots.redfortlabs.xyz",
      languages: {
        en: "https://chatbots.redfortlabs.xyz/en",
        es: "https://chatbots.redfortlabs.xyz/es",
      },
    },
  };
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
