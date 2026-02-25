import type { Metadata } from 'next';
import type { Article } from './content';
import type { Conflict } from './conflicts';
import type { Lang } from './i18n';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vivaldinews.com';
export const SITE_NAME = 'Vivaldi News';

export function buildArticleMetadata(
  article: Article,
  lang: Lang,
  conflict?: Conflict | null
): Metadata {
  const url = conflict
    ? `${SITE_URL}/${lang}/conflict/${conflict.slug}/${article.slug}`
    : `${SITE_URL}/${lang}/news/${article.slug}`;

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.author }],
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.excerpt,
      siteName: SITE_NAME,
      publishedTime: new Date(article.date).toISOString(),
      tags: article.tags,
      images: article.image
        ? [{ url: article.image, alt: article.image_alt ?? article.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : [],
    },
    alternates: {
      canonical: url,
      languages: {
        en: url.replace(`/${lang}/`, '/en/'),
        es: url.replace(`/${lang}/`, '/es/'),
      },
    },
  };
}

export function buildPageMetadata(
  title: string,
  description: string,
  lang: Lang,
  pagePath = ''
): Metadata {
  const url = `${SITE_URL}/${lang}${pagePath}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${pagePath}`,
        es: `${SITE_URL}/es${pagePath}`,
      },
    },
  };
}

export function buildArticleJsonLd(
  article: Article,
  lang: Lang,
  conflict?: Conflict | null
) {
  const url = conflict
    ? `${SITE_URL}/${lang}/conflict/${conflict?.slug}/${article.slug}`
    : `${SITE_URL}/${lang}/news/${article.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    datePublished: new Date(article.date).toISOString(),
    dateModified: new Date(article.date).toISOString(),
    author: { '@type': 'Organization', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    url,
    image: article.image ? [article.image] : [],
    keywords: article.tags.join(', '),
    inLanguage: lang,
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
