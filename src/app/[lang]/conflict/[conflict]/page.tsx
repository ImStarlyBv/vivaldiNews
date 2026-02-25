import { getAllArticles } from '@/lib/content';
import { getConflict, getAllConflicts } from '@/lib/conflicts';
import { buildPageMetadata } from '@/lib/seo';
import { isValidLang, type Lang, t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';

interface Props {
  params: { lang: string; conflict: string };
}

export async function generateStaticParams() {
  const conflicts = getAllConflicts();
  return ['en', 'es'].flatMap((lang) =>
    conflicts.map((c) => ({ lang, conflict: c.slug }))
  );
}

export async function generateMetadata({ params }: Props) {
  if (!isValidLang(params.lang)) return {};
  const conflict = getConflict(params.conflict);
  if (!conflict) return {};
  return buildPageMetadata(conflict.title, conflict.description, params.lang as Lang);
}

export default function ConflictPage({ params }: Props) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const conflict = getConflict(params.conflict);
  if (!conflict) notFound();

  const tx = t(lang);
  const articles = getAllArticles({ lang, conflict: params.conflict });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900">{conflict.title}</h1>
        <p className="text-gray-500 mt-2">{conflict.description}</p>
      </div>

      {articles.length === 0 ? (
        <p className="text-center text-gray-500 py-16">{tx.noArticles}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.slug + article.lang} article={article} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
