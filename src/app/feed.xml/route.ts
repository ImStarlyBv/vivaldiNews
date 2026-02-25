import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/content';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { getArticleUrl } from '@/lib/i18n';

export async function GET() {
  const articles = getAllArticles({ lang: 'en' }).slice(0, 20);
  const items = articles.map((a) => {
    const url = `${SITE_URL}${getArticleUrl(a.slug, 'en', a.conflict ?? undefined)}`;
    return `<item><title><![CDATA[${a.title}]]></title><link>${url}</link><guid>${url}</guid><description><![CDATA[${a.excerpt}]]></description><pubDate>${new Date(a.date).toUTCString()}</pubDate></item>`;
  }).join('');

  return new NextResponse(`<?xml version="1.0"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${SITE_URL}/en</link><description>Both Sides. Full Picture.</description>${items}</channel></rss>`, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

