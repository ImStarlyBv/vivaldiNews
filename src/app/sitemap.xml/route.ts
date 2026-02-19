import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    select: {
      slug: true,
      language: true,
      updatedAt: true,
    },
  });

  const categories = [
    'politics',
    'business',
    'technology',
    'sports',
    'health',
    'entertainment',
    'science',
    'general',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  ${categories
    .map(
      (category) => `
  <url>
    <loc>${siteUrl}/category/${category}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
  ${articles
    .map((article) => {
      const path = article.language === 'es' ? 'noticias' : 'news';
      return `
  <url>
    <loc>${siteUrl}/${path}/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
