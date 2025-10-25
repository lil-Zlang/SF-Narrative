import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/weekly-news/weeks
 * Fetch list of all available weeks
 */
export async function GET() {
  try {
    const weeks = await prisma.weeklyNews.findMany({
      select: {
        weekOf: true,
      },
      orderBy: {
        weekOf: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: weeks.map(w => ({
        weekOf: w.weekOf,
        label: '', // Can be enhanced with labels later
      })),
    });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

