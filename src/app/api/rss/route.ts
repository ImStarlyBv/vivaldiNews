import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/content';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { isValidLang, type Lang, getArticleUrl } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = (searchParams.get('lang') || 'en') as Lang;
  const category = searchParams.get('category') || undefined;

  if (!isValidLang(lang)) {
    return new NextResponse('Invalid lang', { status: 400 });
  }

  const articles = getAllArticles({ lang, category }).slice(0, 20);

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}${getArticleUrl(a.slug, lang, a.conflict ?? undefined)}`;
      return `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      <pubDate>${new Date(a.date).toUTCString()}</pubDate>
      <category>${a.category}</category>
      ${a.tags?.map((tag) => `<category>${tag}</category>`).join('')}
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${SITE_NAME} — ${lang.toUpperCase()}]]></title>
    <link>${SITE_URL}/${lang}</link>
    <description>Both Sides. Full Picture.</description>
    <language>${lang}</language>
    <atom:link href="${SITE_URL}/api/rss?lang=${lang}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
