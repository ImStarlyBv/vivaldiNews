import { redirect } from 'next/navigation';

// Legacy route — redirects to new localized route
export default function OldNewsPage({ params }: { params: { slug: string } }) {
  redirect(`/en/news/${params.slug}`);
}

export function generateStaticParams() {
  return [];
}
