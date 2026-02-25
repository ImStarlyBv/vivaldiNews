import type { MetadataRoute } from 'next';
import { getAllArticles, getAllConflictArticleParams } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ['en', 'es'] as const;
  const entries: MetadataRoute.Sitemap = [];

  // Language homepages
  for (const lang of langs) {
    entries.push({ url: `${SITE_URL}/${lang}`, changeFrequency: 'hourly', priority: 1.0 });
  }

  // Standard articles
  const standard = getAllArticles().filter((a) => !a.conflict);
  for (const article of standard) {
    entries.push({
      url: `${SITE_URL}/${article.lang}/news/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Conflict articles (one URL per conflict+slug+lang pair)
  const conflictParams = getAllConflictArticleParams();
  for (const p of conflictParams) {
    entries.push({
      url: `${SITE_URL}/${p.lang}/conflict/${p.conflict}/${p.article}`,
      changeFrequency: 'daily',
      priority: 0.9,
    });
  }

  return entries;
}
