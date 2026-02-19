import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 50,
    select: {
      title: true,
      slug: true,
      summary: true,
      language: true,
      publishedAt: true,
      category: true,
    },
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vivaldi News</title>
    <link>${siteUrl}</link>
    <description>Trending Now, Written Fresh - Latest news from around the world</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${articles
      .map((article) => {
        const path = article.language === 'es' ? 'noticias' : 'news';
        return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}/${path}/${article.slug}</link>
      <description><![CDATA[${article.summary}]]></description>
      <pubDate>${article.publishedAt.toUTCString()}</pubDate>
      <category>${article.category}</category>
      <guid isPermaLink="true">${siteUrl}/${path}/${article.slug}</guid>
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
