import { getAllArticles, getAllConflictArticleParams } from '@/lib/content';
import { getConflict, getAllConflicts } from '@/lib/conflicts';
import { buildPageMetadata } from '@/lib/seo';
import { isValidLang, type Lang, t, getArticleUrl } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';

// Need the parent dir to exist too
