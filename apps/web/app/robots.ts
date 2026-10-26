import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/counter/', '/card/', '/spotify/', '/github/'] }],
    sitemap: 'https://nekodb.space/sitemap.xml',
    host: 'https://nekodb.space',
  };
}
