import Link from 'next/link';

const categories = [
  { name: 'Politics', slug: 'politics' },
  { name: 'Business', slug: 'business' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Health', slug: 'health' },
  { name: 'Entertainment', slug: 'entertainment' },
];

export default function Header() {
  return (
    <header className="bg-white border-b-4 border-primary-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 text-center border-b border-gray-200">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight">
              Vivaldi News
            </h1>
            <p className="text-sm text-gray-600 mt-2 tracking-wide uppercase">
              Trending Now, Written Fresh
            </p>
          </Link>
        </div>
        
        <nav className="py-4">
          <ul className="flex items-center justify-center space-x-8 text-sm font-medium">
            <li>
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 transition-colors uppercase tracking-wide"
              >
                Home
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-gray-700 hover:text-primary-600 transition-colors uppercase tracking-wide"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
