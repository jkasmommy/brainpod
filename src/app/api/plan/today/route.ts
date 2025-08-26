import { NextRequest, NextResponse } from 'next/server';
import { buildDailyPlaylist } from '../../../../lib/schedule';
import { PlanItem } from '../../../../lib/types';

export async function GET(request: NextRequest) {
  try {
    // In production, read from database
    // For now, expect plan items to be passed via headers or query params
    const planDataHeader = request.headers.get('x-plan-data');
    const masteryDataHeader = request.headers.get('x-mastery-data');

    if (!planDataHeader) {
      return NextResponse.json(
        { error: 'No plan data found. Generate a plan first.' }, 
        { status: 404 }
      );
    }

    const planItems: PlanItem[] = JSON.parse(planDataHeader);
    const mastery = masteryDataHeader ? JSON.parse(masteryDataHeader) : {};

    // Build today's playlist using spaced repetition
    const todaysPlaylist = buildDailyPlaylist(planItems, mastery);

    // Add lesson details from manifest for display
    const enrichedPlaylist = await enrichPlaylistWithLessonData(todaysPlaylist, request);

    const response = {
      playlist: enrichedPlaylist,
      total_items: todaysPlaylist.length,
      today: new Date().toISOString().split('T')[0],
      next_review_date: calculateNextReviewDate(planItems)
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
