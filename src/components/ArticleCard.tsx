import Link from 'next/link';
import Image from 'next/image';
import ConflictBadge from './ConflictBadge';
import type { Article } from '@/lib/content';
import { formatDate, getArticleUrl, type Lang } from '@/lib/i18n';

interface Props {
  article: Article;
  lang: Lang;
}

export default function ArticleCard({ article, lang }: Props) {
  const href = getArticleUrl(article.slug, lang, article.conflict ?? undefined);
  const date = formatDate(article.date, lang);

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link href={href} className="flex flex-col flex-1">
        <div className="relative h-48 bg-gray-200 flex-shrink-0">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.image_alt ?? article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
              <span className="text-white text-4xl font-bold">VN</span>
            </div>
          )}
          {article.conflict && (
            <div className="absolute top-3 left-3">
              <ConflictBadge />
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full uppercase">
              {article.category}
            </span>
            <span className="text-xs text-gray-500">{date}</span>
            <span className="text-xs text-gray-400">{article.readingTime} min read</span>
          </div>

          <h2 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {article.title}
          </h2>

          <p className="text-gray-600 text-sm line-clamp-3 flex-1">{article.excerpt}</p>

          {article.source_name && (
            <p className="text-xs text-gray-400 mt-3">via {article.source_name}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
