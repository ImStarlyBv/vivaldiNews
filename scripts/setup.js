/**
 * Vivaldi News — Content & Source bootstrapper
 * Creates directory structure and seeds source files on first run.
 * Run via: npm run setup  (also runs automatically before build)
 * Safe to run multiple times — never overwrites existing files.
 */
const fs = require('fs');
const path = require('path');

// ─── Directory creation ────────────────────────────────────────────────────────

const dirs = [
  // Content
  'content/categories',
  'content/articles/ukraine-russia/en',
  'content/articles/ukraine-russia/es',
  'content/articles/israel-palestine/en',
  'content/articles/israel-palestine/es',
  'content/articles/standard/en',
  'content/articles/standard/es',
  'public/flags',
  'public/og',
  // App routes (Next.js dynamic segments use brackets)
  'src/app/[lang]',
  'src/app/[lang]/category/[slug]',
  'src/app/[lang]/conflict/[conflict]/[article]',
  'src/app/[lang]/news/[slug]',
  'src/app/api/rss',
  'src/app/api/revalidate',
  '.github/workflows',
];

for (const dir of dirs) {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`✓ mkdir ${dir}`);
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function writeIfNew(relPath, content) {
  const dest = path.join(process.cwd(), relPath);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, content.trimStart());
    console.log(`✓ created ${relPath}`);
  }
}

// ─── [lang]/layout.tsx ────────────────────────────────────────────────────────
writeIfNew('src/app/[lang]/layout.tsx', `
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isValidLang, type Lang } from '@/lib/i18n';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }];
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  robots: { index: true, follow: true },
};

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  return (
    <html lang={lang}>
      <body className={\`\${inter.className} bg-gray-50\`}>
        <Header lang={lang} />
        <main className="min-h-screen">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
`);

// ─── [lang]/page.tsx ──────────────────────────────────────────────────────────
writeIfNew('src/app/[lang]/page.tsx', `
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
  const baseUrl = category ? \`/\${lang}?category=\${category}\` : \`/\${lang}\`;

  return (
    <>
      <TrendingBar articles={trending} lang={lang} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : tx.latest}
          </h2>
          {category && (
            <a href={\`/\${lang}\`} className="text-sm text-primary-600 hover:underline">← {tx.allNews}</a>
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
`);

// ─── [lang]/category/[slug]/page.tsx ─────────────────────────────────────────
writeIfNew('src/app/[lang]/category/[slug]/page.tsx', `
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
  return buildPageMetadata(title, desc, lang, \`/category/\${params.slug}\`);
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
          <Pagination currentPage={page} totalPages={totalPages} baseUrl={\`/\${lang}/category/\${params.slug}\`} />
        </>
      )}
    </div>
  );
}
`);

// ─── [lang]/conflict/[conflict]/[article]/page.tsx ────────────────────────────
writeIfNew('src/app/[lang]/conflict/[conflict]/[article]/page.tsx', `
import { getConflictArticlePair, getAllConflictArticleParams } from '@/lib/content';
import { getConflict } from '@/lib/conflicts';
import { buildArticleMetadata, buildArticleJsonLd, SITE_URL } from '@/lib/seo';
import { isValidLang, type Lang, formatDate, t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import PerspectiveSwitch from '@/components/PerspectiveSwitch';
import ArticleBody from '@/components/ArticleBody';

interface Props {
  params: { lang: string; conflict: string; article: string };
}

export async function generateStaticParams() {
  return getAllConflictArticleParams().map((p) => ({
    lang: p.lang,
    conflict: p.conflict,
    article: p.article,
  }));
}

export async function generateMetadata({ params }: Props) {
  if (!isValidLang(params.lang)) return {};
  const lang = params.lang as Lang;
  const { sideA } = getConflictArticlePair(params.conflict, params.article, lang);
  const conflict = getConflict(params.conflict);
  if (!sideA || !conflict) return {};
  return buildArticleMetadata(sideA, lang, conflict);
}

export default function ConflictArticlePage({ params }: Props) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const tx = t(lang);

  const conflict = getConflict(params.conflict);
  if (!conflict) notFound();

  const { sideA, sideB } = getConflictArticlePair(params.conflict, params.article, lang);
  if (!sideA || !sideB) notFound();

  const jsonLd = buildArticleJsonLd(sideA, lang, conflict);
  const date = formatDate(sideA.date, lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article meta header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 flex-wrap">
          <a href={\`/\${lang}\`} className="hover:text-primary-600">Home</a>
          <span>/</span>
          <a href={\`/\${lang}/conflict/\${conflict.slug}\`} className="hover:text-primary-600">{conflict.title}</a>
        </div>

        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white uppercase">
            ⚡ {tx.perspectives}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 uppercase">
            {sideA.category}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
          <span className="text-xs text-gray-400">{sideA.readingTime} {tx.minuteRead}</span>
        </div>

        {/* Tags */}
        {sideA.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {sideA.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* The main feature: perspective switch */}
      <PerspectiveSwitch
        conflict={conflict}
        sideAMeta={sideA}
        sideBMeta={sideB}
        sideAContent={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {sideA.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 border-primary-400 pl-4">
              {sideA.excerpt}
            </p>
            <ArticleBody source={sideA.content} />
            {sideA.source_url && (
              <p className="text-xs text-gray-400 mt-8 border-t border-gray-200 pt-4">
                {tx.source}:{' '}
                <a href={sideA.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {sideA.source_name}
                </a>
              </p>
            )}
          </div>
        }
        sideBContent={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              {sideB.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed border-l-4 border-red-400 pl-4">
              {sideB.excerpt}
            </p>
            <ArticleBody source={sideB.content} />
            {sideB.source_url && (
              <p className="text-xs text-gray-400 mt-8 border-t border-gray-200 pt-4">
                {tx.source}:{' '}
                <a href={sideB.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {sideB.source_name}
                </a>
              </p>
            )}
          </div>
        }
      />
    </>
  );
}
`);

// ─── [lang]/news/[slug]/page.tsx ──────────────────────────────────────────────
writeIfNew('src/app/[lang]/news/[slug]/page.tsx', `
import { getArticleBySlug, getAllArticleParams } from '@/lib/content';
import { buildArticleMetadata, buildArticleJsonLd } from '@/lib/seo';
import { isValidLang, type Lang, formatDate, t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ArticleBody from '@/components/ArticleBody';
import Image from 'next/image';

interface Props {
  params: { lang: string; slug: string };
}

export async function generateStaticParams() {
  return getAllArticleParams();
}

export async function generateMetadata({ params }: Props) {
  if (!isValidLang(params.lang)) return {};
  const lang = params.lang as Lang;
  const article = getArticleBySlug(params.slug, lang);
  if (!article) return {};
  return buildArticleMetadata(article, lang);
}

export default function NewsArticlePage({ params }: Props) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const tx = t(lang);

  const article = getArticleBySlug(params.slug, lang);
  if (!article) notFound();

  const jsonLd = buildArticleJsonLd(article, lang);
  const date = formatDate(article.date, lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <a href={\`/\${lang}\`} className="hover:text-primary-600">Home</a>
          <span>/</span>
          <a href={\`/\${lang}/category/\${article.category}\`} className="hover:text-primary-600 capitalize">{article.category}</a>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 uppercase">
            {article.category}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
          <span className="text-xs text-gray-400">{article.readingTime} {tx.minuteRead}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-gray-600 mb-6 leading-relaxed border-l-4 border-primary-400 pl-4">
          {article.excerpt}
        </p>

        {/* Hero image */}
        {article.image && (
          <div className="relative w-full h-64 sm:h-80 mb-8 rounded-lg overflow-hidden">
            <Image src={article.image} alt={article.image_alt || article.title} fill className="object-cover" />
          </div>
        )}

        {/* Article body */}
        <ArticleBody source={article.content} />

        {/* Footer meta */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-4 justify-between text-xs text-gray-400">
          <div>
            {tx.by} <span className="font-medium text-gray-600">{article.author}</span>
            {' · '}{tx.publishedOn} <span className="font-medium text-gray-600">{date}</span>
          </div>
          {article.source_url && (
            <div>
              {tx.source}:{' '}
              <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary-600">
                {article.source_name}
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
`);

// ─── [lang]/conflict/[conflict]/page.tsx (conflict index) ─────────────────────
writeIfNew('src/app/[lang]/conflict/[conflict]/page.tsx', `
import { getAllArticles, getAllConflictArticleParams } from '@/lib/content';
import { getConflict, getAllConflicts } from '@/lib/conflicts';
import { buildPageMetadata } from '@/lib/seo';
import { isValidLang, type Lang, t, getArticleUrl } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';

// Need the parent dir to exist too
`);

// ─── api/rss/route.ts ─────────────────────────────────────────────────────────
writeIfNew('src/app/api/rss/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/content';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import { isValidLang, type Lang, getArticleUrl } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = (searchParams.get('lang') || 'en') as Lang;
  const category = searchParams.get('category') || undefined;

  if (!isValidLang(lang)) {
    return new NextResponse('Invalid lang', { status: 400 });
  }

  const articles = getAllArticles({ lang, category }).slice(0, 20);

  const items = articles
    .map((a) => {
      const url = \`\${SITE_URL}\${getArticleUrl(a.slug, lang, a.conflict ?? undefined)}\`;
      return \`
    <item>
      <title><![CDATA[\${a.title}]]></title>
      <link>\${url}</link>
      <guid isPermaLink="true">\${url}</guid>
      <description><![CDATA[\${a.excerpt}]]></description>
      <pubDate>\${new Date(a.date).toUTCString()}</pubDate>
      <category>\${a.category}</category>
      \${a.tags?.map((tag) => \`<category>\${tag}</category>\`).join('')}
    </item>\`;
    })
    .join('');

  const rss = \`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[\${SITE_NAME} — \${lang.toUpperCase()}]]></title>
    <link>\${SITE_URL}/\${lang}</link>
    <description>Both Sides. Full Picture.</description>
    <language>\${lang}</language>
    <atom:link href="\${SITE_URL}/api/rss?lang=\${lang}" rel="self" type="application/rss+xml" />
    \${items}
  </channel>
</rss>\`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
`);

// ─── api/revalidate/route.ts ──────────────────────────────────────────────────
writeIfNew('src/app/api/revalidate/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Webhook called by Coolify / GitHub Actions after new content is pushed.
 * Triggers on-demand ISR revalidation for affected paths.
 * Protect with REVALIDATE_SECRET env var.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Revalidate all lang homepages and article pages
  revalidatePath('/en', 'layout');
  revalidatePath('/es', 'layout');
  revalidatePath('/en', 'page');
  revalidatePath('/es', 'page');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
`);

// ─── sitemap.ts ───────────────────────────────────────────────────────────────
writeIfNew('src/app/sitemap.ts', `
import type { MetadataRoute } from 'next';
import { getAllArticles, getAllConflictArticleParams } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = ['en', 'es'] as const;
  const entries: MetadataRoute.Sitemap = [];

  // Language homepages
  for (const lang of langs) {
    entries.push({ url: \`\${SITE_URL}/\${lang}\`, changeFrequency: 'hourly', priority: 1.0 });
  }

  // Standard articles
  const standard = getAllArticles().filter((a) => !a.conflict);
  for (const article of standard) {
    entries.push({
      url: \`\${SITE_URL}/\${article.lang}/news/\${article.slug}\`,
      lastModified: new Date(article.date),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Conflict articles (one URL per conflict+slug+lang pair)
  const conflictParams = getAllConflictArticleParams();
  for (const p of conflictParams) {
    entries.push({
      url: \`\${SITE_URL}/\${p.lang}/conflict/\${p.conflict}/\${p.article}\`,
      changeFrequency: 'daily',
      priority: 0.9,
    });
  }

  return entries;
}
`);

// ─── robots.ts ────────────────────────────────────────────────────────────────
writeIfNew('src/app/robots.ts', `
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: \`\${SITE_URL}/sitemap.xml\`,
  };
}
`);

// ─── GitHub Actions workflow ───────────────────────────────────────────────────
writeIfNew('.github/workflows/validate-content.yml', `
name: Validate Content

on:
  push:
    paths:
      - 'content/**'
  pull_request:
    paths:
      - 'content/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node scripts/validate-content.js
`);

// ─── Content validation script ────────────────────────────────────────────────
writeIfNew('scripts/validate-content.js', `
/**
 * Validates all article frontmatter fields.
 * Run via GitHub Actions on content push.
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = ['title', 'slug', 'lang', 'date', 'category', 'excerpt', 'author', 'source_name'];
const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

let errors = 0;

function getMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) results.push(...getMdFiles(full));
    else if (item.endsWith('.md') || item.endsWith('.mdx')) results.push(full);
  }
  return results;
}

for (const file of getMdFiles(ARTICLES_DIR)) {
  const raw = fs.readFileSync(file, 'utf-8');
  const match = raw.match(/^---\\n([\\s\\S]*?)\\n---/);
  if (!match) {
    console.error('❌ Missing frontmatter:', file);
    errors++;
    continue;
  }

  const frontmatter = {};
  for (const line of match[1].split('\\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) frontmatter[key.trim()] = rest.join(':').trim();
  }

  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      console.error(\`❌ Missing field "\${field}" in \${file}\`);
      errors++;
    }
  }

  // Validate lang
  if (!['en', 'es'].includes(frontmatter.lang?.replace(/['"]/g, ''))) {
    console.error(\`❌ Invalid lang "\${frontmatter.lang}" in \${file}\`);
    errors++;
  }

  // Validate side if conflict present
  const conflict = frontmatter.conflict?.replace(/['"]/g, '');
  const side = frontmatter.side?.replace(/['"]/g, '');
  if (conflict && conflict !== 'null' && !['A', 'B'].includes(side)) {
    console.error(\`❌ Conflict article must have side: A or B in \${file}\`);
    errors++;
  }
}

if (errors === 0) {
  console.log('✅ All content files valid.');
} else {
  console.error(\`\\n❌ Found \${errors} validation error(s).\`);
  process.exit(1);
}
`);

// ─── Seed categories ─────────────────────────────────────────────────────────

const categories = {
  'world.json': { slug: 'world', label: { en: 'World', es: 'Mundo' }, description: { en: 'International news and global affairs', es: 'Noticias internacionales y asuntos globales' }, seoTitle: { en: 'World News | Vivaldi News', es: 'Noticias del Mundo | Vivaldi News' }, metaDescription: { en: 'Latest world news from all perspectives', es: 'Últimas noticias del mundo desde todas las perspectivas' } },
  'politics.json': { slug: 'politics', label: { en: 'Politics', es: 'Política' }, description: { en: 'Political news, elections, and government affairs', es: 'Noticias políticas, elecciones y gobierno' }, seoTitle: { en: 'Politics | Vivaldi News', es: 'Política | Vivaldi News' }, metaDescription: { en: 'Latest political news', es: 'Últimas noticias políticas' } },
  'technology.json': { slug: 'technology', label: { en: 'Technology', es: 'Tecnología' }, description: { en: 'Tech, AI, science and innovation', es: 'Tecnología, IA, ciencia e innovación' }, seoTitle: { en: 'Technology | Vivaldi News', es: 'Tecnología | Vivaldi News' }, metaDescription: { en: 'Latest tech and AI news', es: 'Últimas noticias de tecnología e IA' } },
  'business.json': { slug: 'business', label: { en: 'Business', es: 'Negocios' }, description: { en: 'Business, economy, markets and finance', es: 'Negocios, economía y mercados' }, seoTitle: { en: 'Business | Vivaldi News', es: 'Negocios | Vivaldi News' }, metaDescription: { en: 'Latest business and economy news', es: 'Últimas noticias de negocios y economía' } },
  'sports.json': { slug: 'sports', label: { en: 'Sports', es: 'Deportes' }, description: { en: 'Sports news, results and analysis', es: 'Noticias deportivas, resultados y análisis' }, seoTitle: { en: 'Sports | Vivaldi News', es: 'Deportes | Vivaldi News' }, metaDescription: { en: 'Latest sports news', es: 'Últimas noticias deportivas' } },
  'entertainment.json': { slug: 'entertainment', label: { en: 'Entertainment', es: 'Entretenimiento' }, description: { en: 'Entertainment, culture, movies and music', es: 'Entretenimiento, cultura, cine y música' }, seoTitle: { en: 'Entertainment | Vivaldi News', es: 'Entretenimiento | Vivaldi News' }, metaDescription: { en: 'Latest entertainment news', es: 'Últimas noticias de entretenimiento' } },
};

for (const [file, data] of Object.entries(categories)) {
  const dest = path.join(process.cwd(), 'content/categories', file);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, JSON.stringify(data, null, 2));
    console.log(`✓ Seeded content/categories/${file}`);
  }
}

// ─── Seed conflict.json ────────────────────────────────────────────────────────

const conflicts = {
  'ukraine-russia': { slug: 'ukraine-russia', title: 'Ukraine - Russia War', sideA: { name: 'Ukraine', label: 'Ukrainian Perspective', flag: '🇺🇦', color: '#0057B7', accentColor: '#FFD700' }, sideB: { name: 'Russia', label: 'Russian Perspective', flag: '🇷🇺', color: '#CC0000', accentColor: '#FFFFFF' }, description: 'Ongoing war between Russia and Ukraine since February 2022', active: true },
  'israel-palestine': { slug: 'israel-palestine', title: 'Israel - Palestine Conflict', sideA: { name: 'Israel', label: 'Israeli Perspective', flag: '🇮🇱', color: '#003399', accentColor: '#FFFFFF' }, sideB: { name: 'Palestine', label: 'Palestinian Perspective', flag: '🇵🇸', color: '#007A3D', accentColor: '#FFFFFF' }, description: 'Ongoing Israel-Palestine conflict', active: true },
};

for (const [dir, data] of Object.entries(conflicts)) {
  const dest = path.join(process.cwd(), 'content/articles', dir, 'conflict.json');
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, JSON.stringify(data, null, 2));
    console.log(`✓ Seeded content/articles/${dir}/conflict.json`);
  }
}

// ─── Seed sample articles ──────────────────────────────────────────────────────

const sampleArticles = [
  { path: 'content/articles/ukraine-russia/en/2024-02-24-kyiv-frontlines-side-a.md', content: `---\ntitle: "Ukraine Holds the Line on Eastern Frontlines Near Kharkiv"\nslug: "kyiv-frontlines-2024"\nconflict: "ukraine-russia"\nside: "A"\nlang: "en"\ndate: "2024-02-24"\ncategory: "world"\nexcerpt: "Ukrainian forces report holding defensive positions east of Kharkiv despite sustained Russian pressure, according to military officials in Kyiv."\nauthor: "Vivaldi News Desk"\nsource_url: "https://example.com"\nsource_name: "Sample Source"\nimage: null\nimage_alt: null\ntags: ["ukraine", "russia", "war", "kharkiv", "military"]\nfeatured: true\n---\n\nUkrainian military officials confirmed on Sunday that defensive positions east of Kharkiv remain intact despite increased Russian shelling over the past 48 hours.\n\n## Situation on the Ground\n\nThe Ukrainian General Staff reported that forces successfully repelled multiple infantry assaults in the Kharkiv region.\n\n"Our troops are holding firm," said a spokesperson for the Ukrainian armed forces.\n\n## International Support\n\nWestern allies continued to express solidarity with Ukraine, reaffirming commitments to long-term military assistance packages.\n` },
  { path: 'content/articles/ukraine-russia/en/2024-02-24-kyiv-frontlines-side-b.md', content: `---\ntitle: "Russian Forces Advance on Strategic Positions in Kharkiv Oblast"\nslug: "kyiv-frontlines-2024"\nconflict: "ukraine-russia"\nside: "B"\nlang: "en"\ndate: "2024-02-24"\ncategory: "world"\nexcerpt: "Russian Ministry of Defence claims significant territorial gains near Kharkiv, citing the liberation of key strategic positions."\nauthor: "Vivaldi News Desk"\nsource_url: "https://example.com"\nsource_name: "Sample Source"\nimage: null\nimage_alt: null\ntags: ["ukraine", "russia", "war", "kharkiv", "military"]\nfeatured: true\n---\n\nThe Russian Ministry of Defence announced that its forces had secured several key positions in the Kharkiv Oblast, describing the operation as proceeding according to plan.\n\n## Official Russian Position\n\nRussian military command stated that its forces neutralised multiple Ukrainian fortified positions.\n\n"The special military operation is unfolding according to plan," the ministry said.\n\n## Context\n\nRussia has framed the conflict as a defensive operation against NATO expansion.\n` },
  { path: 'content/articles/ukraine-russia/es/2024-02-24-fronteras-kyiv-side-a.md', content: `---\ntitle: "Ucrania Mantiene las Posiciones Defensivas en el Este de Járkov"\nslug: "fronteras-kyiv-2024"\nconflict: "ukraine-russia"\nside: "A"\nlang: "es"\ndate: "2024-02-24"\ncategory: "world"\nexcerpt: "Las fuerzas ucranianas informan que mantienen las posiciones defensivas al este de Járkov a pesar de la presión rusa."\nauthor: "Vivaldi News"\nsource_url: "https://example.com"\nsource_name: "Fuente de Ejemplo"\nimage: null\nimage_alt: null\ntags: ["ucrania", "rusia", "guerra", "járkov"]\nfeatured: true\n---\n\nLas autoridades militares ucranianas confirmaron que las posiciones defensivas al este de Járkov permanecen intactas.\n\n## La Situación sobre el Terreno\n\nEl Estado Mayor de Ucrania informó que las fuerzas repelieron con éxito múltiples asaltos.\n` },
  { path: 'content/articles/ukraine-russia/es/2024-02-24-fronteras-kyiv-side-b.md', content: `---\ntitle: "Fuerzas Rusas Avanzan en Posiciones Estratégicas en la Óblast de Járkov"\nslug: "fronteras-kyiv-2024"\nconflict: "ukraine-russia"\nside: "B"\nlang: "es"\ndate: "2024-02-24"\ncategory: "world"\nexcerpt: "El Ministerio de Defensa ruso afirma haber obtenido avances territoriales significativos cerca de Járkov."\nauthor: "Vivaldi News"\nsource_url: "https://example.com"\nsource_name: "Fuente de Ejemplo"\nimage: null\nimage_alt: null\ntags: ["ucrania", "rusia", "guerra", "járkov"]\nfeatured: true\n---\n\nEl Ministerio de Defensa de Rusia anunció que sus fuerzas aseguraron varias posiciones clave en la Óblast de Járkov.\n\n## Posición Oficial Rusa\n\n"La operación militar especial se desarrolla según el plan", informó el ministerio.\n` },
  { path: 'content/articles/israel-palestine/en/2024-10-07-gaza-operations-side-a.md', content: `---\ntitle: "Israel Confirms Targeted Operations in Gaza Following Security Threats"\nslug: "gaza-operations-oct-2024"\nconflict: "israel-palestine"\nside: "A"\nlang: "en"\ndate: "2024-10-07"\ncategory: "world"\nexcerpt: "Israeli Defence Forces confirm ongoing operations in Gaza aimed at dismantling militant infrastructure following cross-border attacks."\nauthor: "Vivaldi News Desk"\nsource_url: "https://example.com"\nsource_name: "Sample Source"\nimage: null\nimage_alt: null\ntags: ["israel", "palestine", "gaza", "conflict", "middle-east"]\nfeatured: true\n---\n\nThe Israel Defence Forces confirmed ongoing military operations in the Gaza Strip, stating the objective is to dismantle militant infrastructure.\n\n## IDF Statement\n\n"We are doing everything possible to minimise civilian harm while eliminating the terrorist threat," the spokesperson said.\n\nToggle the switch above to read the Palestinian perspective.\n` },
  { path: 'content/articles/israel-palestine/en/2024-10-07-gaza-operations-side-b.md', content: `---\ntitle: "Gaza Under Siege: Palestinian Health Officials Report Mass Casualties"\nslug: "gaza-operations-oct-2024"\nconflict: "israel-palestine"\nside: "B"\nlang: "en"\ndate: "2024-10-07"\ncategory: "world"\nexcerpt: "Palestinian health authorities report hundreds of casualties as Gaza faces continued bombardment, with hospitals overwhelmed and aid blocked."\nauthor: "Vivaldi News Desk"\nsource_url: "https://example.com"\nsource_name: "Sample Source"\nimage: null\nimage_alt: null\ntags: ["israel", "palestine", "gaza", "conflict", "middle-east"]\nfeatured: true\n---\n\nPalestinian health authorities in Gaza reported a severe humanitarian crisis, with hospitals overwhelmed and international aid access severely restricted.\n\n## Humanitarian Crisis\n\n"We are calling on the international community to intervene immediately," said the ministry spokesperson.\n\nToggle the switch above to read the Israeli perspective.\n` },
  { path: 'content/articles/standard/en/2024-02-25-tech-ai-investment.md', content: `---\ntitle: "Global Tech Industry Reports Record Investment in AI Infrastructure"\nslug: "tech-ai-investment-2024"\nconflict: null\nside: null\nlang: "en"\ndate: "2024-02-25"\ncategory: "technology"\nexcerpt: "Major technology companies announced unprecedented capital expenditure on AI data centres, signalling a new era of computing investment."\nauthor: "Vivaldi News Desk"\nsource_url: "https://example.com"\nsource_name: "Sample Source"\nimage: null\nimage_alt: null\ntags: ["technology", "ai", "investment", "big-tech"]\nfeatured: false\n---\n\nThe global technology industry announced record levels of capital investment in AI infrastructure this week.\n\n## The Numbers\n\nCombined announcements suggest over $300 billion in planned AI infrastructure spending over the next three years.\n\n## What It Means\n\n"This is the PC moment, but for AI," said one industry analyst.\n` },
  { path: 'content/articles/standard/es/2024-02-25-inversion-ia.md', content: `---\ntitle: "La Industria Tecnológica Global Registra Inversión Récord en IA"\nslug: "inversion-ia-2024"\nconflict: null\nside: null\nlang: "es"\ndate: "2024-02-25"\ncategory: "technology"\nexcerpt: "Las principales empresas tecnológicas anunciaron un gasto de capital sin precedentes en centros de datos de IA."\nauthor: "Vivaldi News"\nsource_url: "https://example.com"\nsource_name: "Fuente de Ejemplo"\nimage: null\nimage_alt: null\ntags: ["tecnología", "ia", "inversión", "big-tech"]\nfeatured: false\n---\n\nLa industria tecnológica global anunció niveles récord de inversión en infraestructura de inteligencia artificial esta semana.\n\n## Las Cifras\n\nLos anuncios combinados sugieren más de 300.000 millones de dólares en gastos planificados.\n` },
];

for (const { path: relPath, content } of sampleArticles) {
  const dest = path.join(process.cwd(), relPath);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, content);
    console.log(`✓ Seeded ${relPath}`);
  }
}

console.log('\n✅ Vivaldi News setup complete. Run: npm run dev\n');


const dirs = [
  'content/categories',
  'content/articles/ukraine-russia/en',
  'content/articles/ukraine-russia/es',
  'content/articles/israel-palestine/en',
  'content/articles/israel-palestine/es',
  'content/articles/standard/en',
  'content/articles/standard/es',
  'public/flags',
  'public/og',
];

for (const dir of dirs) {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`✓ Created ${dir}`);
  }
}

// Seed category JSON files if they don't exist yet
const categories = {
  'world.json': {
    slug: 'world',
    label: { en: 'World', es: 'Mundo' },
    description: { en: 'International news and global affairs', es: 'Noticias internacionales y asuntos globales' },
    seoTitle: { en: 'World News | Vivaldi News', es: 'Noticias del Mundo | Vivaldi News' },
    metaDescription: { en: 'Latest world news from all perspectives', es: 'Últimas noticias del mundo desde todas las perspectivas' },
  },
  'politics.json': {
    slug: 'politics',
    label: { en: 'Politics', es: 'Política' },
    description: { en: 'Political news, elections, and government affairs', es: 'Noticias políticas, elecciones y gobierno' },
    seoTitle: { en: 'Politics | Vivaldi News', es: 'Política | Vivaldi News' },
    metaDescription: { en: 'Latest political news from all perspectives', es: 'Últimas noticias políticas desde todas las perspectivas' },
  },
  'technology.json': {
    slug: 'technology',
    label: { en: 'Technology', es: 'Tecnología' },
    description: { en: 'Tech, AI, science and innovation', es: 'Tecnología, IA, ciencia e innovación' },
    seoTitle: { en: 'Technology | Vivaldi News', es: 'Tecnología | Vivaldi News' },
    metaDescription: { en: 'Latest tech and AI news', es: 'Últimas noticias de tecnología e IA' },
  },
  'business.json': {
    slug: 'business',
    label: { en: 'Business', es: 'Negocios' },
    description: { en: 'Business, economy, markets and finance', es: 'Negocios, economía y mercados' },
    seoTitle: { en: 'Business | Vivaldi News', es: 'Negocios | Vivaldi News' },
    metaDescription: { en: 'Latest business and economy news', es: 'Últimas noticias de negocios y economía' },
  },
  'sports.json': {
    slug: 'sports',
    label: { en: 'Sports', es: 'Deportes' },
    description: { en: 'Sports news, results and analysis', es: 'Noticias deportivas, resultados y análisis' },
    seoTitle: { en: 'Sports | Vivaldi News', es: 'Deportes | Vivaldi News' },
    metaDescription: { en: 'Latest sports news', es: 'Últimas noticias deportivas' },
  },
  'entertainment.json': {
    slug: 'entertainment',
    label: { en: 'Entertainment', es: 'Entretenimiento' },
    description: { en: 'Entertainment, culture, movies and music', es: 'Entretenimiento, cultura, cine y música' },
    seoTitle: { en: 'Entertainment | Vivaldi News', es: 'Entretenimiento | Vivaldi News' },
    metaDescription: { en: 'Latest entertainment news', es: 'Últimas noticias de entretenimiento' },
  },
};

for (const [file, data] of Object.entries(categories)) {
  const dest = path.join(process.cwd(), 'content/categories', file);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, JSON.stringify(data, null, 2));
    console.log(`✓ Seeded content/categories/${file}`);
  }
}

// Seed conflict.json files
const conflicts = {
  'ukraine-russia': {
    slug: 'ukraine-russia',
    title: 'Ukraine - Russia War',
    sideA: { name: 'Ukraine', label: 'Ukrainian Perspective', flag: '🇺🇦', color: '#0057B7', accentColor: '#FFD700' },
    sideB: { name: 'Russia', label: 'Russian Perspective', flag: '🇷🇺', color: '#CC0000', accentColor: '#FFFFFF' },
    description: 'Ongoing war between Russia and Ukraine since February 2022',
    active: true,
  },
  'israel-palestine': {
    slug: 'israel-palestine',
    title: 'Israel - Palestine Conflict',
    sideA: { name: 'Israel', label: 'Israeli Perspective', flag: '🇮🇱', color: '#003399', accentColor: '#FFFFFF' },
    sideB: { name: 'Palestine', label: 'Palestinian Perspective', flag: '🇵🇸', color: '#007A3D', accentColor: '#FFFFFF' },
    description: 'Ongoing Israel-Palestine conflict',
    active: true,
  },
};

for (const [dir, data] of Object.entries(conflicts)) {
  const dest = path.join(process.cwd(), 'content/articles', dir, 'conflict.json');
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, JSON.stringify(data, null, 2));
    console.log(`✓ Seeded content/articles/${dir}/conflict.json`);
  }
}

// Seed sample articles
const sampleArticles = [
  {
    path: 'content/articles/ukraine-russia/en/2024-02-24-kyiv-frontlines-side-a.md',
    content: `---
title: "Ukraine Holds the Line on Eastern Frontlines Near Kharkiv"
slug: "kyiv-frontlines-2024"
conflict: "ukraine-russia"
side: "A"
lang: "en"
date: "2024-02-24"
category: "world"
excerpt: "Ukrainian forces report holding defensive positions east of Kharkiv despite sustained Russian pressure, according to military officials in Kyiv."
author: "Vivaldi News Desk"
source_url: "https://example.com"
source_name: "Sample Source"
image: null
image_alt: null
tags: ["ukraine", "russia", "war", "kharkiv", "military"]
featured: true
---

Ukrainian military officials confirmed on Sunday that defensive positions east of Kharkiv remain intact despite increased Russian shelling over the past 48 hours.

## Situation on the Ground

The Ukrainian General Staff reported that forces successfully repelled multiple infantry assaults in the Kharkiv region, inflicting significant casualties on advancing units.

"Our troops are holding firm," said a spokesperson for the Ukrainian armed forces. "The enemy continues to throw manpower at our positions, but our defenders are standing strong."

## International Support

Western allies continued to express solidarity with Ukraine, with several NATO members reaffirming commitments to long-term military assistance packages.

The situation remains fluid, and Vivaldi News will continue providing updates from both sides of the conflict.
`,
  },
  {
    path: 'content/articles/ukraine-russia/en/2024-02-24-kyiv-frontlines-side-b.md',
    content: `---
title: "Russian Forces Advance on Strategic Positions in Kharkiv Oblast"
slug: "kyiv-frontlines-2024"
conflict: "ukraine-russia"
side: "B"
lang: "en"
date: "2024-02-24"
category: "world"
excerpt: "Russian Ministry of Defence claims significant territorial gains near Kharkiv, citing the liberation of key strategic positions from Ukrainian control."
author: "Vivaldi News Desk"
source_url: "https://example.com"
source_name: "Sample Source"
image: null
image_alt: null
tags: ["ukraine", "russia", "war", "kharkiv", "military"]
featured: true
---

The Russian Ministry of Defence announced on Sunday that its forces had secured several key positions in the Kharkiv Oblast, describing the operation as proceeding according to plan.

## Official Russian Position

Russian military command stated that its forces neutralised multiple Ukrainian fortified positions and seized tactically important high ground in the region.

"The special military operation is unfolding according to plan," the ministry said in its daily briefing. "Our forces continue to liberate territories and eliminate nationalist formations."

## Context

Russia has framed the conflict as a defensive operation against NATO expansion and what it describes as threats to Russian-speaking populations in eastern Ukraine.

Vivaldi News presents both sides of this conflict. Toggle the switch above to read the Ukrainian perspective.
`,
  },
  {
    path: 'content/articles/ukraine-russia/es/2024-02-24-fronteras-kyiv-side-a.md',
    content: `---
title: "Ucrania Mantiene las Posiciones Defensivas en el Este de Járkov"
slug: "fronteras-kyiv-2024"
conflict: "ukraine-russia"
side: "A"
lang: "es"
date: "2024-02-24"
category: "world"
excerpt: "Las fuerzas ucranianas informan que mantienen las posiciones defensivas al este de Járkov a pesar de la presión sostenida rusa."
author: "Vivaldi News"
source_url: "https://example.com"
source_name: "Fuente de Ejemplo"
image: null
image_alt: null
tags: ["ucrania", "rusia", "guerra", "járkov", "militar"]
featured: true
---

Las autoridades militares ucranianas confirmaron que las posiciones defensivas al este de Járkov permanecen intactas a pesar del incremento en los bombardeos rusos durante las últimas 48 horas.

## La Situación sobre el Terreno

El Estado Mayor de Ucrania informó que las fuerzas repelieron con éxito múltiples asaltos de infantería en la región de Járkov.

"Nuestras tropas están resistiendo", declaró un portavoz de las fuerzas armadas ucranianas.

## Apoyo Internacional

Los aliados occidentales continuaron expresando solidaridad con Ucrania, reafirmando compromisos de asistencia militar a largo plazo.
`,
  },
  {
    path: 'content/articles/ukraine-russia/es/2024-02-24-fronteras-kyiv-side-b.md',
    content: `---
title: "Fuerzas Rusas Avanzan en Posiciones Estratégicas en la Óblast de Járkov"
slug: "fronteras-kyiv-2024"
conflict: "ukraine-russia"
side: "B"
lang: "es"
date: "2024-02-24"
category: "world"
excerpt: "El Ministerio de Defensa ruso afirma haber obtenido avances territoriales significativos cerca de Járkov."
author: "Vivaldi News"
source_url: "https://example.com"
source_name: "Fuente de Ejemplo"
image: null
image_alt: null
tags: ["ucrania", "rusia", "guerra", "járkov", "militar"]
featured: true
---

El Ministerio de Defensa de Rusia anunció que sus fuerzas aseguraron varias posiciones clave en la Óblast de Járkov, describiendo la operación como en curso según lo previsto.

## Posición Oficial Rusa

El mando militar ruso declaró que sus fuerzas neutralizaron múltiples posiciones fortificadas ucranianas y tomaron terreno táctico importante en la región.

"La operación militar especial se desarrolla según el plan", informó el ministerio en su parte diario.

## Contexto

Rusia ha enmarcado el conflicto como una operación defensiva ante la expansión de la OTAN.

Vivaldi News presenta ambos lados. Usa el interruptor de arriba para leer la perspectiva ucraniana.
`,
  },
  {
    path: 'content/articles/israel-palestine/en/2024-10-07-gaza-operations-side-a.md',
    content: `---
title: "Israel Confirms Targeted Operations in Gaza Following Security Threats"
slug: "gaza-operations-oct-2024"
conflict: "israel-palestine"
side: "A"
lang: "en"
date: "2024-10-07"
category: "world"
excerpt: "Israeli Defence Forces confirm ongoing operations in Gaza aimed at dismantling militant infrastructure, following cross-border attacks."
author: "Vivaldi News Desk"
source_url: "https://example.com"
source_name: "Sample Source"
image: null
image_alt: null
tags: ["israel", "palestine", "gaza", "conflict", "middle-east"]
featured: true
---

The Israel Defence Forces (IDF) confirmed ongoing military operations in the Gaza Strip on Monday, stating the objective is to dismantle militant infrastructure and recover hostages.

## IDF Statement

IDF spokesperson stated that the operations are targeted and precise, aimed at eliminating threats to Israeli civilians.

"We are doing everything possible to minimise civilian harm while eliminating the terrorist threat," the spokesperson said.

## Hostage Situation

Israeli officials indicated that negotiations for the release of hostages held in Gaza continue through third-party mediators, while military pressure is maintained.

Toggle the switch above to read the Palestinian perspective.
`,
  },
  {
    path: 'content/articles/israel-palestine/en/2024-10-07-gaza-operations-side-b.md',
    content: `---
title: "Gaza Under Siege: Palestinian Health Officials Report Mass Casualties"
slug: "gaza-operations-oct-2024"
conflict: "israel-palestine"
side: "B"
lang: "en"
date: "2024-10-07"
category: "world"
excerpt: "Palestinian health authorities report hundreds of casualties as Gaza faces continued bombardment, with hospitals overwhelmed and aid blocked."
author: "Vivaldi News Desk"
source_url: "https://example.com"
source_name: "Sample Source"
image: null
image_alt: null
tags: ["israel", "palestine", "gaza", "conflict", "middle-east"]
featured: true
---

Palestinian health authorities in Gaza reported a severe humanitarian crisis on Monday, with hospitals overwhelmed and international aid access severely restricted.

## Humanitarian Crisis

Gaza's Health Ministry reported that medical facilities are operating far beyond capacity, with critical shortages of medicine, fuel, and basic supplies.

"We are calling on the international community to intervene immediately," said the ministry's spokesperson.

## International Response

Several UN agencies and international humanitarian organisations called for immediate ceasefires to allow the delivery of emergency aid to the civilian population.

Toggle the switch above to read the Israeli perspective.
`,
  },
  {
    path: 'content/articles/standard/en/2024-02-25-tech-industry-growth.md',
    content: `---
title: "Global Tech Industry Reports Record Investment in AI Infrastructure"
slug: "tech-ai-investment-2024"
conflict: null
side: null
lang: "en"
date: "2024-02-25"
category: "technology"
excerpt: "Major technology companies announced unprecedented capital expenditure on AI data centres and infrastructure, signalling a new era of computing investment."
author: "Vivaldi News Desk"
source_url: "https://example.com"
source_name: "Sample Source"
image: null
image_alt: null
tags: ["technology", "ai", "investment", "data-centers", "big-tech"]
featured: false
---

The global technology industry announced record levels of capital investment in artificial intelligence infrastructure this week, with major players committing hundreds of billions to new data centres and chip manufacturing.

## The Numbers

Combined announcements from leading tech companies suggest over $300 billion in planned AI infrastructure spending over the next three years, a figure that dwarfs previous investment cycles.

## What It Means

Analysts say the investment reflects a fundamental shift in how technology companies view AI — not as a product feature, but as the core of future computing infrastructure.

"This is the PC moment, but for AI," said one industry analyst.

## Concerns

Critics have raised questions about energy consumption, water usage for cooling, and the concentration of AI capabilities among a small number of large corporations.
`,
  },
  {
    path: 'content/articles/standard/es/2024-02-25-crecimiento-tecnologico.md',
    content: `---
title: "La Industria Tecnológica Global Registra Inversión Récord en Infraestructura de IA"
slug: "inversion-ia-2024"
conflict: null
side: null
lang: "es"
date: "2024-02-25"
category: "technology"
excerpt: "Las principales empresas tecnológicas anunciaron un gasto de capital sin precedentes en centros de datos de IA e infraestructura."
author: "Vivaldi News"
source_url: "https://example.com"
source_name: "Fuente de Ejemplo"
image: null
image_alt: null
tags: ["tecnología", "ia", "inversión", "centros-de-datos", "big-tech"]
featured: false
---

La industria tecnológica global anunció niveles récord de inversión en infraestructura de inteligencia artificial esta semana, con los principales actores comprometiendo cientos de miles de millones en nuevos centros de datos.

## Las Cifras

Los anuncios combinados de las principales empresas tecnológicas sugieren más de 300.000 millones de dólares en gastos planificados en infraestructura de IA durante los próximos tres años.

## Qué Significa

Los analistas dicen que la inversión refleja un cambio fundamental en cómo las empresas tecnológicas ven la IA, no como una función de producto, sino como el núcleo de la infraestructura informática futura.

## Preocupaciones

Los críticos han planteado preguntas sobre el consumo de energía y la concentración de capacidades de IA entre un pequeño número de grandes corporaciones.
`,
  },
];

for (const { path: relPath, content } of sampleArticles) {
  const dest = path.join(process.cwd(), relPath);
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, content);
    console.log(`✓ Seeded ${relPath}`);
  }
}

console.log('\n✅ Vivaldi News content setup complete.\n');
