import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Webhook called by Coolify / GitHub Actions after new content is pushed.
 * Triggers on-demand ISR revalidation for affected paths.
 * Protect with REVALIDATE_SECRET env var.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Revalidate all lang homepages and article pages
  revalidatePath('/en', 'layout');
  revalidatePath('/es', 'layout');
  revalidatePath('/en', 'page');
  revalidatePath('/es', 'page');

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
