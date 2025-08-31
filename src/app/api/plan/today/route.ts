import { NextRequest, NextResponse } from 'next/server';
import { buildDailyPlaylist } from '../../../../lib/schedule';
import { PlanItem } from '../../../../lib/types';
import { SubjectKey } from '../../../../lib/levels';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') as SubjectKey | null;
    
    // In production, read from database based on user session
    // For now, simulate reading from localStorage via headers or return mock data
    const planDataHeader = request.headers.get('x-plan-data');
    const masteryDataHeader = request.headers.get('x-mastery-data');

    let planItems: PlanItem[] = [];
    let mastery = {};

    if (planDataHeader) {
      planItems = JSON.parse(planDataHeader);
      mastery = masteryDataHeader ? JSON.parse(masteryDataHeader) : {};
    } else {
      // If no plan data provided, create some mock items for demo
      if (subject) {
        planItems = generateMockPlanItems(subject);
      } else {
        // Return empty playlist
        return NextResponse.json({
          playlist: [],
          total_items: 0,
          today: new Date().toISOString().split('T')[0],
          message: 'No learning plan found. Generate a plan to get started.'
        });
      }
    }

    // Filter by subject if specified
    if (subject) {
      planItems = planItems.filter(item => 
        item.lessonId.startsWith(subject) || 
        item.skills?.some(skill => skill.includes(subject))
      );
    }

    // Build today's playlist using spaced repetition
    const todaysPlaylist = buildDailyPlaylist(planItems, mastery);

    // Add lesson details from manifest for display
    const enrichedPlaylist = await enrichPlaylistWithLessonData(todaysPlaylist, request);

    const response = {
      playlist: enrichedPlaylist,
      total_items: todaysPlaylist.length,
      today: new Date().toISOString().split('T')[0],
      next_review_date: calculateNextReviewDate(planItems),
      subject: subject || 'all'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error building daily playlist:', error);
    return NextResponse.json(
      { error: 'Failed to build daily playlist' }, 
      { status: 500 }
    );
  }
}

/**
 * Generate mock plan items for demo purposes
 */
function generateMockPlanItems(subject: SubjectKey): PlanItem[] {
  const baseItems = {
    math: [
      {
        lessonId: 'math-1-counting-1',
        skills: ['number-recognition', 'counting'],
        scheduled_for: new Date().toISOString(),
        status: 'todo' as const,
        priority: 100,
        title: 'Number Recognition 1-10',
        minutes: 15,
        standards: ['K.CC.A.1'],
        difficulty: 0
      },
      {
        lessonId: 'math-1-counting-2', 
        skills: ['counting-sequence'],
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
        status: 'locked' as const,
        priority: 90,
        title: 'Counting Forward from Any Number',
        minutes: 15,
        standards: ['K.CC.A.2'],
        difficulty: 0.1
      }
    ],
    reading: [
      {
        lessonId: 'reading-1-phonics-1',
        skills: ['letter-sounds', 'phonics'],
        scheduled_for: new Date().toISOString(),
        status: 'todo' as const,
        priority: 100,
        title: 'Letter Sounds A-E',
        minutes: 20,
        standards: ['K.RF.3'],
        difficulty: 0
      }
    ],
    science: [
      {
        lessonId: 'science-1-living-1',
        skills: ['living-nonliving'],
        scheduled_for: new Date().toISOString(),
        status: 'todo' as const,
        priority: 100,
        title: 'Living vs Non-Living Things',
        minutes: 15,
        standards: ['K-LS1-1'],
        difficulty: 0
      }
    ],
    'social-studies': [
      {
        lessonId: 'social-studies-1-community-1',
        skills: ['community-helpers'],
        scheduled_for: new Date().toISOString(),
        status: 'todo' as const,
        priority: 100,
        title: 'Community Helpers',
        minutes: 15,
        standards: ['K.Civ.1'],
        difficulty: 0
      }
    ]
  };

  return baseItems[subject] || [];
}

/**
 * Enrich playlist items with lesson details from manifest
 */
async function enrichPlaylistWithLessonData(playlist: PlanItem[], request: NextRequest) {
  try {
    const manifestRes = await fetch(new URL('/content/manifest.json', request.url));
    if (!manifestRes.ok) return playlist;

    const manifest = await manifestRes.json();
    
    return playlist.map(item => {
      // Find lesson details in manifest
      const lessonDetails = findLessonInManifest(item.lessonId, manifest);
      
      return {
        ...item,
        title: lessonDetails?.title || 'Unknown Lesson',
        minutes: lessonDetails?.minutes || 10,
        standards: lessonDetails?.standards || [],
        difficulty: lessonDetails?.difficulty || 0
      };
    });
  } catch (error) {
    console.error('Error enriching playlist:', error);
    return playlist;
  }
}

/**
 * Find lesson details in the manifest by lesson ID
 */
function findLessonInManifest(lessonId: string, manifest: any) {
  for (const subject in manifest) {
    for (const grade in manifest[subject]) {
      for (const unit in manifest[subject][grade]) {
        const lessons = manifest[subject][grade][unit].lessons;
        const lesson = lessons.find((l: any) => l.id === lessonId);
        if (lesson) return lesson;
      }
    }
  }
  return null;
}

/**
 * Calculate when the next review is scheduled
 */
function calculateNextReviewDate(planItems: PlanItem[]): string | null {
  const today = new Date();
  const futureDates = planItems
    .map(item => new Date(item.scheduled_for))
    .filter(date => date > today)
    .sort((a, b) => a.getTime() - b.getTime());

  return futureDates.length > 0 
    ? futureDates[0].toISOString().split('T')[0] 
    : null;
}
