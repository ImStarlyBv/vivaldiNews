import Link from 'next/link';
import Image from 'next/image';

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    summary: string;
    imageUrl: string | null;
    category: string;
    language: string;
    publishedAt: Date;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const articlePath = article.language === 'es' ? '/noticias' : '/news';
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    article.language === 'es' ? 'es-DO' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`${articlePath}/${article.slug}`}>
        <div className="relative h-48 bg-gray-200">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
              <span className="text-white text-4xl font-bold">VN</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full uppercase">
              {article.category}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>
          
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {article.title}
          </h2>
          
          <p className="text-gray-600 text-sm line-clamp-3">
            {article.summary}
          </p>
        </div>
      </Link>
    </article>
  );
}
