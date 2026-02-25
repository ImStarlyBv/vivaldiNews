import { getConflictArticlePair, getAllConflictArticleParams } from '@/lib/content';
import { getConflict } from '@/lib/conflicts';
import { buildArticleMetadata, buildArticleJsonLd, SITE_URL } from '@/lib/seo';
import { isValidLang, type Lang, formatDate, t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import PerspectiveSwitch from '@/components/PerspectiveSwitch';
import ArticleBody from '@/components/ArticleBody';

interface Props {
  params: { lang: string; conflict: string; article: string };
}

export async function generateStaticParams() {
  return getAllConflictArticleParams().map((p) => ({
    lang: p.lang,
    conflict: p.conflict,
    article: p.article,
  }));
}

export async function generateMetadata({ params }: Props) {
  if (!isValidLang(params.lang)) return {};
  const lang = params.lang as Lang;
  const { sideA } = getConflictArticlePair(params.conflict, params.article, lang);
  const conflict = getConflict(params.conflict);
  if (!sideA || !conflict) return {};
  return buildArticleMetadata(sideA, lang, conflict);
}

export default function ConflictArticlePage({ params }: Props) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const tx = t(lang);

  const conflict = getConflict(params.conflict);
  if (!conflict) notFound();

  const { sideA, sideB } = getConflictArticlePair(params.conflict, params.article, lang);
  if (!sideA || !sideB) notFound();

  const jsonLd = buildArticleJsonLd(sideA, lang, conflict);
  const date = formatDate(sideA.date, lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article meta header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 flex-wrap">
          <a href={`/${lang}`} className="hover:text-primary-600">Home</a>
          <span>/</span>
          <a href={`/${lang}/conflict/${conflict.slug}`} className="hover:text-primary-600">{conflict.title}</a>
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white uppercase">
            ⚡ {tx.perspectives}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 uppercase">
            {sideA.category}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
          <span className="text-xs text-gray-400">{sideA.readingTime} {tx.minuteRead}</span>
        </div>

        {/* Tags */}
        {sideA.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {sideA.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* The main feature: perspective switch */}
      <PerspectiveSwitch
        conflict={conflict}
        sideAMeta={sideA}
        sideBMeta={sideB}
        sideAContent={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {sideA.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 border-primary-400 pl-4">
              {sideA.excerpt}
            </p>
            <ArticleBody source={sideA.content} />
            {sideA.source_url && (
              <p className="text-xs text-gray-400 mt-8 border-t border-gray-200 pt-4">
                {tx.source}:{' '}
                <a href={sideA.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {sideA.source_name}
                </a>
              </p>
            )}
          </div>
        }
        sideBContent={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {sideB.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 border-red-400 pl-4">
              {sideB.excerpt}
            </p>
            <ArticleBody source={sideB.content} />
            {sideB.source_url && (
              <p className="text-xs text-gray-400 mt-8 border-t border-gray-200 pt-4">
                {tx.source}:{' '}
                <a href={sideB.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {sideB.source_name}
                </a>
              </p>
            )}
          </div>
        }
      />
    </>
  );
}
