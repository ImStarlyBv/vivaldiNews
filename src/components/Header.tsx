import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { getAllCategories, getCategoryLabel } from '@/lib/categories';
import { getAllConflicts } from '@/lib/conflicts';
import type { Lang } from '@/lib/i18n';
import { getCategoryUrl, t } from '@/lib/i18n';

interface Props {
  lang: Lang;
}

export default function Header({ lang }: Props) {
  const categories = getAllCategories();
  const conflicts = getAllConflicts().filter((c) => c.active);
  const tx = t(lang);

  return (
    <header className="bg-white border-b-4 border-primary-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: logo + lang switcher */}
        <div className="py-5 flex items-center justify-between border-b border-gray-100">
          <Link href={`/${lang}`} className="inline-block">
            <h1 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">
              Vivaldi News
            </h1>
            <p className="text-xs text-gray-500 mt-1 tracking-widest uppercase">
              {tx.tagline}
            </p>
          </Link>
          <LanguageSwitcher currentLang={lang} />
        </div>

        {/* Nav */}
        <nav className="py-3 overflow-x-auto">
          <ul className="flex items-center gap-6 text-sm font-medium whitespace-nowrap">
            <li>
              <Link href={`/${lang}`} className="text-gray-700 hover:text-primary-600 transition-colors uppercase tracking-wide">
                {tx.home}
              </Link>
            </li>

            {/* Categories */}
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={getCategoryUrl(cat.slug, lang)}
                  className="text-gray-700 hover:text-primary-600 transition-colors uppercase tracking-wide"
                >
                  {getCategoryLabel(cat, lang)}
                </Link>
              </li>
            ))}

            {/* Conflicts separator */}
            {conflicts.length > 0 && (
              <li className="text-gray-300 select-none">|</li>
            )}

            {/* Conflict links */}
            {conflicts.map((conflict) => (
              <li key={conflict.slug}>
                <Link
                  href={`/${lang}/conflict/${conflict.slug}`}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors font-semibold uppercase tracking-wide text-xs"
                >
                  <span>⚡</span>
                  <span>{conflict.sideA.name} vs {conflict.sideB.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
