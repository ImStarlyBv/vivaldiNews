import { NextResponse } from 'next/server';
import { getAllArticles, getAllConflictArticleParams } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';

export async function GET() {
  const langs = ['en', 'es'];
  const urls: string[] = [];

  for (const lang of langs) {
    urls.push(`<url><loc>${SITE_URL}/${lang}</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`);
    for (const a of getAllArticles({ lang }).filter((x) => !x.conflict)) {
      urls.push(`<url><loc>${SITE_URL}/${lang}/news/${a.slug}</loc><lastmod>${a.date}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
    }
  }
  for (const p of getAllConflictArticleParams()) {
    urls.push(`<url><loc>${SITE_URL}/${p.lang}/conflict/${p.conflict}/${p.article}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`);
  }

  return new NextResponse(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  });
}

