import Link from 'next/link';
import type { Lang } from '@/lib/i18n';
import { t } from '@/lib/i18n';

export default function Footer({ lang }: { lang: Lang }) {
  const tx = t(lang);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-serif font-bold mb-3">Vivaldi News</h3>
            <p className="text-sm leading-relaxed">{tx.description}</p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Languages</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/en" className="hover:text-primary-400 transition-colors">🇺🇸 English</Link></li>
              <li><Link href="/es" className="hover:text-primary-400 transition-colors">🇪🇸 Español</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/api/rss?lang=${lang}`} className="hover:text-primary-400 transition-colors">
                  {tx.rss}
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-primary-400 transition-colors">
                  {tx.sitemap}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-500">
          <p>© {year} Vivaldi News. All rights reserved. · Both Sides. Full Picture.</p>
        </div>
      </div>
    </footer>
  );
}
