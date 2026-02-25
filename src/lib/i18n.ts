export type Lang = 'en' | 'es';

export const SUPPORTED_LANGS: Lang[] = ['en', 'es'];
export const DEFAULT_LANG: Lang = 'en';

export const i18n = {
  en: {
    home: 'Home',
    latest: 'Latest News',
    category: 'Category',
    conflicts: 'Conflicts',
    readMore: 'Read More',
    minuteRead: 'min read',
    source: 'Source',
    perspectives: 'Perspectives',
    switchTo: 'Switch to',
    viewing: 'Viewing',
    allNews: 'All News',
    search: 'Search',
    tagline: 'Both Sides. Full Picture.',
    description: 'Conflict-aware news from all perspectives. We show you both sides.',
    featuredArticles: 'Featured',
    latestArticles: 'Latest',
    noArticles: 'No articles found. Check back soon.',
    page: 'Page',
    of: 'of',
    prev: '← Previous',
    next: 'Next →',
    by: 'By',
    publishedOn: 'Published on',
    tags: 'Tags',
    rss: 'RSS Feed',
    sitemap: 'Sitemap',
  },
  es: {
    home: 'Inicio',
    latest: 'Últimas Noticias',
    category: 'Categoría',
    conflicts: 'Conflictos',
    readMore: 'Leer Más',
    minuteRead: 'min de lectura',
    source: 'Fuente',
    perspectives: 'Perspectivas',
    switchTo: 'Cambiar a',
    viewing: 'Viendo',
    allNews: 'Todas las Noticias',
    search: 'Buscar',
    tagline: 'Ambos Lados. Imagen Completa.',
    description: 'Noticias de conflictos desde todas las perspectivas. Te mostramos ambos lados.',
    featuredArticles: 'Destacados',
    latestArticles: 'Recientes',
    noArticles: 'No se encontraron artículos. Vuelve pronto.',
    page: 'Página',
    of: 'de',
    prev: '← Anterior',
    next: 'Siguiente →',
    by: 'Por',
    publishedOn: 'Publicado el',
    tags: 'Etiquetas',
    rss: 'Feed RSS',
    sitemap: 'Mapa del sitio',
  },
} as const;

export type T = typeof i18n.en;

export function t(lang: Lang): T {
  return i18n[lang] ?? i18n.en;
}

export function isValidLang(lang: string): lang is Lang {
  return SUPPORTED_LANGS.includes(lang as Lang);
}

export function getArticleUrl(slug: string, lang: Lang, conflict?: string): string {
  if (conflict) return `/${lang}/conflict/${conflict}/${slug}`;
  return `/${lang}/news/${slug}`;
}

export function getCategoryUrl(slug: string, lang: Lang): string {
  return `/${lang}/category/${slug}`;
}

export function formatDate(dateStr: string, lang: Lang): string {
  return new Date(dateStr).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
