import { getArticleBySlug, getAllArticleParams } from '@/lib/content';
import { buildArticleMetadata, buildArticleJsonLd } from '@/lib/seo';
import { isValidLang, type Lang, formatDate, t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ArticleBody from '@/components/ArticleBody';
import Image from 'next/image';

interface Props {
  params: { lang: string; slug: string };
}

export async function generateStaticParams() {
  return getAllArticleParams();
}

export async function generateMetadata({ params }: Props) {
  if (!isValidLang(params.lang)) return {};
  const lang = params.lang as Lang;
  const article = getArticleBySlug(params.slug, lang);
  if (!article) return {};
  return buildArticleMetadata(article, lang);
}

export default function NewsArticlePage({ params }: Props) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const tx = t(lang);

  const article = getArticleBySlug(params.slug, lang);
  if (!article) notFound();

  const jsonLd = buildArticleJsonLd(article, lang);
  const date = formatDate(article.date, lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <a href={`/${lang}`} className="hover:text-primary-600">Home</a>
          <span>/</span>
          <a href={`/${lang}/category/${article.category}`} className="hover:text-primary-600 capitalize">{article.category}</a>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 uppercase">
            {article.category}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
          <span className="text-xs text-gray-400">{article.readingTime} {tx.minuteRead}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-gray-600 mb-6 leading-relaxed border-l-4 border-primary-400 pl-4">
          {article.excerpt}
        </p>

        {/* Hero image */}
        {article.image && (
          <div className="relative w-full h-64 sm:h-80 mb-8 rounded-lg overflow-hidden">
            <Image src={article.image} alt={article.image_alt || article.title} fill className="object-cover" />
          </div>
        )}

        {/* Article body */}
        <ArticleBody source={article.content} />

        {/* Footer meta */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-between text-xs text-gray-400">
          <div>
            {tx.by} <span className="font-medium text-gray-600">{article.author}</span>
            {' · '}{tx.publishedOn} <span className="font-medium text-gray-600">{date}</span>
          </div>
          {article.source_url && (
            <div>
              {tx.source}:{' '}
              <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary-600">
                {article.source_name}
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
