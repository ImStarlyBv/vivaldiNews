import fs from 'fs';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

export interface ConflictSide {
  name: string;
  label: string;
  flag: string;
  color: string;
  accentColor: string;
}

export interface Conflict {
  slug: string;
  title: string;
  sideA: ConflictSide;
  sideB: ConflictSide;
  description: string;
  active: boolean;
}

export function getConflict(slug: string): Conflict | null {
  const filePath = path.join(ARTICLES_DIR, slug, 'conflict.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Conflict;
  } catch {
    return null;
  }
}

export function getAllConflicts(): Conflict[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((dir) => {
      if (dir === 'standard') return false;
      return fs.existsSync(path.join(ARTICLES_DIR, dir, 'conflict.json'));
    })
    .map((dir) => getConflict(dir))
    .filter(Boolean) as Conflict[];
}
