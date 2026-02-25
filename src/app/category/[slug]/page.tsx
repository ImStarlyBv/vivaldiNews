import { redirect } from 'next/navigation';

export default function OldCategoryPage({ params }: { params: { slug: string } }) {
  redirect(`/en/category/${params.slug}`);
}

export function generateStaticParams() {
  return [];
}

