import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vivaldi News - Trending Now, Written Fresh',
  description: 'Stay informed with the latest trending news from around the world. Fresh articles published hourly.',
  keywords: ['news', 'trending', 'breaking news', 'world news', 'latest headlines'],
  authors: [{ name: 'Vivaldi News' }],
  creator: 'Vivaldi News',
  publisher: 'Vivaldi News',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Vivaldi News',
    title: 'Vivaldi News - Trending Now, Written Fresh',
    description: 'Stay informed with the latest trending news from around the world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vivaldi News - Trending Now, Written Fresh',
    description: 'Stay informed with the latest trending news from around the world.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
