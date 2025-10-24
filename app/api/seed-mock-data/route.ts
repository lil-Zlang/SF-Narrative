import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Seeding mock timeline data...');

    const mockEvents = [
      {
        headline: '#LaborDayWeekend',
        weekOf: new Date('2025-09-01'),
        hypeSummary: 'San Francisco residents are buzzing with excitement about Labor Day weekend! The city is alive with energy as people celebrate the unofficial end of summer. Many are sharing photos of packed beaches, vibrant street festivals, and the iconic fog rolling over the Golden Gate Bridge. The weekend represents a perfect blend of relaxation and celebration, with locals and tourists alike embracing the city\'s unique charm.',
        backlashSummary: 'While many are excited, some residents are expressing frustration about the crowds and increased traffic during Labor Day weekend. Complaints about overcrowded public spaces, expensive parking, and the commercialization of the holiday are circulating. Some locals are choosing to avoid the city center entirely, citing noise pollution and the overwhelming number of tourists disrupting their daily routines.',
        weeklyPulse: 'This Labor Day weekend perfectly captures San Francisco\'s ongoing tension between being a tourist destination and a livable city for residents. The excitement reflects the city\'s vibrant culture, while the backlash highlights the growing pains of urban density and tourism impact.'
      },
      {
        headline: '#SuperFlexArtFest',
        weekOf: new Date('2025-09-08'),
        hypeSummary: 'The SuperFlex Art Festival is generating incredible buzz across San Francisco! Artists and art lovers are celebrating the city\'s thriving creative community and the festival\'s innovative approach to public art. Social media is flooded with stunning photos of installations, interactive exhibits, and the collaborative spirit that defines SF\'s art scene. The festival is being praised for bringing together diverse communities and showcasing the city\'s commitment to supporting local artists.',
        backlashSummary: 'However, some critics are questioning the festival\'s impact on local neighborhoods, with concerns about gentrification and the displacement of long-time residents. There are complaints about noise levels, street closures, and the commercialization of public spaces. Some argue that the festival feels more like a tourist attraction than a genuine community event, with ticket prices excluding many local residents.',
        weeklyPulse: 'The SuperFlex Art Festival represents San Francisco\'s ongoing struggle to balance cultural vibrancy with community preservation. The excitement shows the city\'s creative spirit, while the criticism reflects deeper concerns about who gets to participate in and benefit from the city\'s cultural renaissance.'
      },
      {
        headline: '#Dreamforce',
        weekOf: new Date('2025-10-13'),
        hypeSummary: 'Dreamforce 2025 is electrifying San Francisco! The tech community is abuzz with excitement about the latest innovations, keynote speeches, and networking opportunities. Attendees are sharing their experiences of the massive conference, highlighting the city\'s position as a global tech hub. The event is generating positive energy around San Francisco\'s tech ecosystem and its role in driving innovation forward.',
        backlashSummary: 'Yet, many residents are expressing frustration about the conference\'s impact on the city. Complaints about blocked streets, increased hotel prices, and the overwhelming presence of tech workers are widespread. Some locals feel excluded from their own city during the event, with concerns about the conference\'s contribution to the city\'s affordability crisis and the displacement of non-tech workers.',
        weeklyPulse: 'Dreamforce encapsulates San Francisco\'s complex relationship with the tech industry. While it showcases the city\'s innovation leadership, it also highlights the ongoing tension between economic growth and community preservation that defines modern San Francisco.'
      }
    ];

    const results = [];

    for (const eventData of mockEvents) {
      try {
        const timelineEvent = await prisma.timelineEvent.upsert({
          where: {
            weekOf: eventData.weekOf,
          },
          update: {
            headline: eventData.headline,
            hypeSummary: eventData.hypeSummary,
            backlashSummary: eventData.backlashSummary,
            weeklyPulse: eventData.weeklyPulse,
            updatedAt: new Date(),
          },
          create: {
            headline: eventData.headline,
            weekOf: eventData.weekOf,
            hypeSummary: eventData.hypeSummary,
            backlashSummary: eventData.backlashSummary,
            weeklyPulse: eventData.weeklyPulse,
          },
        });

        console.log(`Created/updated timeline event: ${timelineEvent.headline}`);
        results.push({
          id: timelineEvent.id,
          headline: timelineEvent.headline,
          weekOf: timelineEvent.weekOf,
        });
      } catch (error) {
        console.error(`Error creating event ${eventData.headline}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mock timeline data seeded successfully',
      eventsCreated: results.length,
      events: results,
    });
  } catch (error) {
    console.error('Seeding failed:', error);
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
