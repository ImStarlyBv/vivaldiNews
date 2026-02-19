import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import TrendingBar from '@/components/TrendingBar';
import Pagination from '@/components/Pagination';

const ARTICLES_PER_PAGE = 12;

export const revalidate = 300; // Revalidate every 5 minutes

interface HomePageProps {
  searchParams: { page?: string; country?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const page = parseInt(searchParams.page || '1');
  const country = searchParams.country;

  const where = country ? { country } : {};

  const [articles, totalCount, trendingArticles] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: ARTICLES_PER_PAGE,
      skip: (page - 1) * ARTICLES_PER_PAGE,
      select: {
        slug: true,
        title: true,
        summary: true,
        imageUrl: true,
        category: true,
        language: true,
        publishedAt: true,
      },
    }),
    prisma.article.count({ where }),
    prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        slug: true,
        title: true,
        language: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  return (
    <>
      <TrendingBar articles={trendingArticles} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            Latest News
          </h2>
          
          {!country && (
            <div className="flex space-x-2">
              <a
                href="/?country=US"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                🇺🇸 US News
              </a>
              <a
                href="/?country=DO"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                🇩🇴 RD News
              </a>
            </div>
          )}
          
          {country && (
            <a
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ← All News
            </a>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl={country ? `/?country=${country}` : '/'}
            />
          </>
        )}
      </div>
    </>
  );
}
