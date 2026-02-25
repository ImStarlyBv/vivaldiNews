import fs from 'fs';
import path from 'path';
import type { Lang } from './i18n';

const CATEGORIES_DIR = path.join(process.cwd(), 'content', 'categories');

export interface Category {
  slug: string;
  label: Record<string, string>;
  description: Record<string, string>;
  seoTitle: Record<string, string>;
  metaDescription: Record<string, string>;
}

export function getCategory(slug: string): Category | null {
  const filePath = path.join(CATEGORIES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Category;
  } catch {
    return null;
  }
}

export function getAllCategories(): Category[] {
  if (!fs.existsSync(CATEGORIES_DIR)) return [];
  return fs
    .readdirSync(CATEGORIES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => getCategory(f.replace('.json', '')))
    .filter(Boolean) as Category[];
}

export function getCategoryLabel(cat: Category, lang: Lang): string {
  return cat.label[lang] ?? cat.label['en'] ?? cat.slug;
}
