import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-serif font-bold mb-4">
              Vivaldi News
            </h3>
            <p className="text-sm">
              Trending Now, Written Fresh. Your source for the latest news from around the world.
            </p>
          </div>
          
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Regions
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?country=US" className="hover:text-primary-400 transition-colors">
                  United States
                </Link>
              </li>
              <li>
                <Link href="/?country=DO" className="hover:text-primary-400 transition-colors">
                  Dominican Republic
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/feed.xml" className="hover:text-primary-400 transition-colors">
                  RSS Feed
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="hover:text-primary-400 transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {currentYear} Vivaldi News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
