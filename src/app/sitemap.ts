import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? 'http://localhost:3000';
  const paths = ['', '/collections', '/customize', '/size-guide', '/about', '/contact', '/privacy'];
  const locales = ['en', 'ar'];
  return locales.flatMap((l) =>
    paths.map((p) => ({ url: `${base}/${l}${p}`, lastModified: new Date(), changeFrequency: 'weekly' as const })),
  );
}
