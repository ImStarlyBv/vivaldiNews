import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/content';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';
  const article = getArticleBySlug(params.slug, lang);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(article);
}

