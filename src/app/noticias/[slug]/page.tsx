import { redirect } from 'next/navigation';

// Legacy route — redirects to new localized route
export default function OldNoticiasPage({ params }: { params: { slug: string } }) {
  redirect(`/es/news/${params.slug}`);
}

export function generateStaticParams() {
  return [];
}
