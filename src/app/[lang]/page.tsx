import { getPaginatedArticles, getTrendingArticles } from '@/lib/content';
import { buildPageMetadata } from '@/lib/seo';
import { t, isValidLang, type Lang } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import TrendingBar from '@/components/TrendingBar';
import Pagination from '@/components/Pagination';

const PER_PAGE = 12;

interface Props {
  params: { lang: string };
  searchParams: { page?: string; category?: string };
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }];
}

export async function generateMetadata({ params }: Props) {
  if (!isValidLang(params.lang)) return {};
  const lang = params.lang as Lang;
  const tx = t(lang);
  return buildPageMetadata('Vivaldi News', tx.description, lang);
}

export default function HomePage({ params, searchParams }: Props) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const tx = t(lang);
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const category = searchParams.category;

  const { articles, totalPages } = getPaginatedArticles(lang, page, PER_PAGE, category ? { category } : undefined);
  const trending = getTrendingArticles(lang, 5);
  const baseUrl = category ? `/${lang}?category=${category}` : `/${lang}`;

  return (
    <>
      <TrendingBar articles={trending} lang={lang} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : tx.latest}
          </h2>
          {category && (
            <a href={`/${lang}`} className="text-sm text-primary-600 hover:underline">← {tx.allNews}</a>
          )}
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-gray-500 py-16">{tx.noArticles}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.slug + article.lang} article={article} lang={lang} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
          </>
        )}
      </div>
    </>
  );
}
