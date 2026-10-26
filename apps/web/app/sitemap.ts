import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: 'https://nekodb.space/', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://nekodb.space/docs/', lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
