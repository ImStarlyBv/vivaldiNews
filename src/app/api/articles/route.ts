import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/content';
import { isValidLang, type Lang } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = (searchParams.get('lang') || 'en') as Lang;
  const category = searchParams.get('category') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!isValidLang(lang)) {
    return NextResponse.json({ error: 'Invalid lang' }, { status: 400 });
  }

  const all = getAllArticles({ lang, category });
  const total = all.length;
  const articles = all.slice((page - 1) * limit, page * limit).map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    date: a.date,
    category: a.category,
    conflict: a.conflict,
    side: a.side,
    lang: a.lang,
    tags: a.tags,
    image: a.image,
  }));

  return NextResponse.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
}

