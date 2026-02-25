'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Lang } from '@/lib/i18n';

interface Props {
  currentLang: Lang;
}

const LANG_LABELS: Record<string, string> = {
  en: '🇺🇸 EN',
  es: '🇪🇸 ES',
};

export default function LanguageSwitcher({ currentLang }: Props) {
  const pathname = usePathname();

  function buildLangUrl(newLang: Lang): string {
    // Replace the first path segment (the lang) with newLang
    const parts = pathname.split('/').filter(Boolean);
    parts[0] = newLang;
    return '/' + parts.join('/');
  }

  return (
    <div className="flex items-center gap-1">
      {(['en', 'es'] as Lang[]).map((lang) => (
        <Link
          key={lang}
          href={buildLangUrl(lang)}
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            currentLang === lang
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {LANG_LABELS[lang]}
        </Link>
      ))}
    </div>
  );
}
