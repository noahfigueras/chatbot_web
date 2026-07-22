import type { MetadataRoute } from "next";

const BASE_URL = "https://chatbots.redfortlabs.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "es"];

  const staticPages = ["", "/signup", "/login"];

  const urls: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      alternates[locale] = `${BASE_URL}/${locale}${page}`;
    }

    urls.push({
      url: `${BASE_URL}/en${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" : "monthly",
      priority: page === "" ? 1 : 0.8,
      alternates: { languages: alternates },
    });
  }

  return urls;
}
