import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

const base = 'https://docs.autotournament.gg';

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: `${base}${page.url === '/' ? '/' : page.url}`,
    changeFrequency: 'weekly',
    priority: page.url === '/' ? 1 : 0.7,
  }));
}
