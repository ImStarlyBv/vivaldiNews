import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, language: 'en' },
  });

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.keywords,
    authors: [{ name: 'Vivaldi News' }],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: `${siteUrl}/news/${article.slug}`,
      title: article.metaTitle,
      description: article.metaDescription,
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
      siteName: 'Vivaldi News',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, language: 'en' },
  });

  if (!article) {
    notFound();
  }

  const formattedDate = article.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.metaDescription,
    image: article.imageUrl || `${siteUrl}/og-image.png`,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Vivaldi News',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vivaldi News',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/news/${article.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href={`/category/${article.category}`}
            className="inline-block px-3 py-1 text-sm font-semibold text-primary-700 bg-primary-100 rounded-full uppercase mb-4"
          >
            {article.category}
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center text-gray-600 text-sm space-x-4">
            <time dateTime={article.publishedAt.toISOString()}>
              {formattedDate}
            </time>
            <span>•</span>
            <span>Vivaldi News</span>
          </div>
        </div>

        {article.imageUrl && (
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 font-medium mb-8 leading-relaxed">
            {article.summary}
          </p>

          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { language: 'en' },
    select: { slug: true },
    take: 100,
  });

  return articles.map((article) => ({
    slug: article.slug,
  }));
}
