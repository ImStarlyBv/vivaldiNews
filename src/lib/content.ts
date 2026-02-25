import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

export interface ArticleFrontmatter {
  title: string;
  slug: string;
  conflict: string | null;
  side: 'A' | 'B' | null;
  lang: string;
  date: string;
  category: string;
  excerpt: string;
  author: string;
  source_url: string;
  source_name: string;
  image: string | null;
  image_alt: string | null;
  tags: string[];
  featured: boolean;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTime: string;
}

function getMdFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      results.push(...getMdFiles(full));
    } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
      results.push(full);
    }
  }
  return results;
}

function parseFile(filePath: string): Article | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const rt = readingTime(content);
    return {
      ...(data as ArticleFrontmatter),
      content,
      readingTime: String(Math.ceil(rt.minutes)),
    };
  } catch {
    return null;
  }
}

export function getAllArticles(filters?: {
  lang?: string;
  category?: string;
  conflict?: string;
  featured?: boolean;
}): Article[] {
  const files = getMdFiles(ARTICLES_DIR);
  let articles = files.map(parseFile).filter(Boolean) as Article[];

  if (filters?.lang) articles = articles.filter((a) => a.lang === filters.lang);
  if (filters?.category) articles = articles.filter((a) => a.category === filters.category);
  if (filters?.conflict !== undefined)
    articles = articles.filter((a) => a.conflict === filters.conflict);
  if (filters?.featured !== undefined)
    articles = articles.filter((a) => a.featured === filters.featured);

  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getArticleBySlug(slug: string, lang: string): Article | null {
  return getAllArticles({ lang }).find((a) => a.slug === slug) ?? null;
}

/** For conflict articles: returns both side A and B for the same slug. */
export function getConflictArticlePair(
  conflictSlug: string,
  articleSlug: string,
  lang: string
): { sideA: Article | null; sideB: Article | null } {
  const articles = getAllArticles({ lang, conflict: conflictSlug }).filter(
    (a) => a.slug === articleSlug
  );
  return {
    sideA: articles.find((a) => a.side === 'A') ?? null,
    sideB: articles.find((a) => a.side === 'B') ?? null,
  };
}

export function getTrendingArticles(lang: string, count = 5): Article[] {
  return getAllArticles({ lang }).slice(0, count);
}

export function getPaginatedArticles(
  lang: string,
  page: number,
  perPage: number,
  filters?: { category?: string; conflict?: string }
): { articles: Article[]; total: number; totalPages: number } {
  const all = getAllArticles({ lang, ...filters });
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return {
    articles: all.slice((page - 1) * perPage, page * perPage),
    total,
    totalPages,
  };
}

/** Returns all unique conflict slugs that have articles in a given language. */
export function getConflictSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter(
      (dir) =>
        dir !== 'standard' &&
        fs.existsSync(path.join(ARTICLES_DIR, dir, 'conflict.json'))
    );
}

/** Returns all article slugs for generateStaticParams. */
export function getAllArticleParams(): { lang: string; slug: string }[] {
  return getAllArticles()
    .filter((a) => !a.conflict)
    .map((a) => ({ lang: a.lang, slug: a.slug }));
}

export function getAllConflictArticleParams(): {
  lang: string;
  conflict: string;
  article: string;
}[] {
  const seen = new Set<string>();
  const results: { lang: string; conflict: string; article: string }[] = [];
  for (const a of getAllArticles().filter((x) => x.conflict)) {
    const key = `${a.lang}-${a.conflict}-${a.slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ lang: a.lang, conflict: a.conflict!, article: a.slug });
    }
  }
  return results;
}
