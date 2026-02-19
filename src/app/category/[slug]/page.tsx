import { prisma } from '@/lib/prisma';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';

const ARTICLES_PER_PAGE = 12;

export const revalidate = 300; // Revalidate every 5 minutes

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  
  return {
    title: `${categoryName} News - Vivaldi News`,
    description: `Latest ${categoryName.toLowerCase()} news and trending stories.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = parseInt(searchParams.page || '1');
  const category = params.slug;

  const [articles, totalCount] = await Promise.all([
    prisma.article.findMany({
      where: { category },
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
    prisma.article.count({ where: { category } }),
  ]);

  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
          {categoryName}
        </h1>
        <p className="text-gray-600">
          {totalCount} {totalCount === 1 ? 'article' : 'articles'} in this category
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found in this category.</p>
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
            baseUrl={`/category/${category}`}
          />
        </>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  const categories = [
    'politics',
    'business',
    'technology',
    'sports',
    'health',
    'entertainment',
    'science',
    'general',
  ];

  return categories.map((category) => ({
    slug: category,
  }));
}
