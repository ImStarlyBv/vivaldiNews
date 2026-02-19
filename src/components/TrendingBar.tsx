import Link from 'next/link';

interface TrendingBarProps {
  articles: Array<{
    slug: string;
    title: string;
    language: string;
  }>;
}

export default function TrendingBar({ articles }: TrendingBarProps) {
  if (articles.length === 0) return null;

  return (
    <div className="bg-primary-600 text-white py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <span className="font-bold uppercase text-sm whitespace-nowrap">
            🔥 Trending:
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="flex space-x-8 animate-scroll">
              {articles.map((article) => {
                const path = article.language === 'es' ? '/noticias' : '/news';
                return (
                  <Link
                    key={article.slug}
                    href={`${path}/${article.slug}`}
                    className="text-sm hover:underline whitespace-nowrap"
                  >
                    {article.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
