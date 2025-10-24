import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { eventId, hypePercentage, backlashPercentage } = await request.json();
    
    // Validate input
    if (!eventId || typeof hypePercentage !== 'number' || typeof backlashPercentage !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    if (hypePercentage < 0 || hypePercentage > 100 || backlashPercentage < 0 || backlashPercentage > 100) {
      return NextResponse.json(
        { success: false, error: 'Percentages must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (Math.abs(hypePercentage + backlashPercentage - 100) > 1) {
      return NextResponse.json(
        { success: false, error: 'Hype and backlash percentages must sum to 100' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for basic analytics
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Save the user vote
    const userVote = await prisma.userVote.create({
      data: {
        eventId,
        hypePercentage: Math.round(hypePercentage),
        backlashPercentage: Math.round(backlashPercentage),
        ipAddress: ipAddress.substring(0, 50), // Limit length
        userAgent: userAgent.substring(0, 500), // Limit length
      }
    });

    // Calculate updated community sentiment
    const allVotes = await prisma.userVote.findMany({
      where: { eventId },
      select: { hypePercentage: true, backlashPercentage: true }
    });

    const avgHype = allVotes.reduce((sum, vote) => sum + vote.hypePercentage, 0) / allVotes.length;
    const avgBacklash = allVotes.reduce((sum, vote) => sum + vote.backlashPercentage, 0) / allVotes.length;

    const communitySentiment = {
      hype: Math.round(avgHype),
      backlash: Math.round(avgBacklash),
      totalVotes: allVotes.length
    };

    // Update the event with new community sentiment
    await prisma.timelineEvent.update({
      where: { id: eventId },
      data: { communitySentiment }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Vote recorded successfully',
      userVote,
      communitySentiment,
      totalVotes: allVotes.length
    });
  } catch (error) {
    console.error('Error saving user vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save vote' },
      { status: 500 }
    );
  }
}
