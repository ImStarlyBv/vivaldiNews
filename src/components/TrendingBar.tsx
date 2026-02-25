import Link from 'next/link';
import type { Article } from '@/lib/content';
import { getArticleUrl, type Lang } from '@/lib/i18n';

interface Props {
  articles: Article[];
  lang: Lang;
}

export default function TrendingBar({ articles, lang }: Props) {
  if (articles.length === 0) return null;

  // Duplicate for seamless CSS scroll loop
  const doubled = [...articles, ...articles];

  return (
    <div className="bg-primary-600 text-white py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="font-bold uppercase text-xs whitespace-nowrap tracking-wider flex-shrink-0">
            🔥 Trending:
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-10 animate-scroll">
              {doubled.map((article, i) => (
                <Link
                  key={`${article.slug}-${i}`}
                  href={getArticleUrl(article.slug, lang, article.conflict ?? undefined)}
                  className="text-sm hover:underline whitespace-nowrap"
                >
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
