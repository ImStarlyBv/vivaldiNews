import { NextRequest, NextResponse } from 'next/server';

// Deprecated endpoint — use /api/revalidate for webhook-based revalidation
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Endpoint deprecated. Use /api/revalidate.' }, { status: 410 });
}
