import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | ChatBot Pro — Free AI Chatbot Builder",
    default: "ChatBot Pro — Create AI Chatbots for WhatsApp & Telegram | Free",
  },
  description:
    "Train a custom AI chatbot from your files and links. Deploy to WhatsApp, Telegram, Slack, and your website — free, no credit card required.",
  keywords: [
    "chatbot builder",
    "AI chatbot",
    "WhatsApp chatbot",
    "Telegram chatbot",
    "no code chatbot",
    "free chatbot",
    "customer support bot",
    "AI assistant",
  ],
  authors: [{ name: "RedFortLabs" }],
  creator: "RedFortLabs",
  publisher: "RedFortLabs",
  metadataBase: new URL("https://chatbots.redfortlabs.xyz"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      es: "/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chatbots.redfortlabs.xyz",
    siteName: "ChatBot Pro",
    title: "ChatBot Pro — Create AI Chatbots for WhatsApp & Telegram | Free",
    description:
      "Train a custom AI chatbot from your files and links. Deploy to WhatsApp, Telegram, Slack, and your website — free, no credit card required.",
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
    title: "ChatBot Pro — Create AI Chatbots for WhatsApp & Telegram | Free",
    description:
      "Train a custom AI chatbot from your files and links. Deploy to WhatsApp, Telegram, Slack, and your website — free.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ChatBot Pro",
    "description":
      "Train a custom AI chatbot from your files and links. Deploy to WhatsApp, Telegram, Slack, and your website — free, no credit card required.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://chatbots.redfortlabs.xyz",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Free tier available with 5 chatbots and 500 messages each",
    },
    "author": {
      "@type": "Organization",
      "name": "RedFortLabs",
      "url": "https://redfortlabs.xyz",
    },
  };

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-YS26148SKF"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YS26148SKF');
        `}
      </Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
