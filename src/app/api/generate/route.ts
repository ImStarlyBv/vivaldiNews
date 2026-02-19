import { NextRequest, NextResponse } from 'next/server';
import { generateNewsArticle } from '@/lib/generator';

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const cronSecret = request.headers.get('x-cron-secret');
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate article
    const result = await generateNewsArticle();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      article: result.article,
    });
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
