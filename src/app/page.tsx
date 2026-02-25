import { redirect } from 'next/navigation';

// Root "/" redirects to default language homepage
export default function RootPage() {
  redirect('/en');
}
