import { getPaginatedArticles } from '@/lib/content';
import { getCategory, getAllCategories, getCategoryLabel } from '@/lib/categories';
import { buildPageMetadata } from '@/lib/seo';
import { isValidLang, type Lang, t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';

const PER_PAGE = 12;

interface Props {
  params: { lang: string; slug: string };
  searchParams: { page?: string };
}

export async function generateStaticParams() {
  const cats = getAllCategories();
  return ['en', 'es'].flatMap((lang) => cats.map((cat) => ({ lang, slug: cat.slug })));
}

export async function generateMetadata({ params }: Props) {
  if (!isValidLang(params.lang)) return {};
  const lang = params.lang as Lang;
  const cat = getCategory(params.slug);
  if (!cat) return {};
  const title = cat.seoTitle[lang] || cat.seoTitle['en'] || cat.slug;
  const desc = cat.metaDescription[lang] || cat.metaDescription['en'] || '';
  return buildPageMetadata(title, desc, lang, `/category/${params.slug}`);
}

export default function CategoryPage({ params, searchParams }: Props) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const cat = getCategory(params.slug);
  if (!cat) notFound();

  const tx = t(lang);
  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const { articles, totalPages } = getPaginatedArticles(lang, page, PER_PAGE, { category: params.slug });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{tx.category}</p>
        <h1 className="text-4xl font-serif font-bold text-gray-900">{getCategoryLabel(cat, lang)}</h1>
        <p className="text-gray-500 mt-2">{cat.description[lang] || cat.description['en']}</p>
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
          <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/${lang}/category/${params.slug}`} />
        </>
      )}
    </div>
  );
}
