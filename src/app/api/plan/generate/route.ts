import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '../../../../lib/plan';
import { Manifest, SkillGraph, Placement } from '../../../../lib/types';
import { abilityToLabelAndStart } from '../../../../lib/placementMaps';

export async function POST(request: NextRequest) {
  try {
    const { subject } = await request.json();

    if (!subject || !['math', 'reading', 'science', 'social-studies'].includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject provided' }, 
        { status: 400 }
      );
    }

    // Read placement from localStorage simulation (would be from database in production)
    // For now, we'll expect the client to send placement data or read from headers
    const placementHeader = request.headers.get('x-placement-data');
    let placement: Placement;

    if (placementHeader) {
      placement = JSON.parse(placementHeader);
    } else {
      // Fallback: create a default placement for testing
      const { label, grade, unit } = abilityToLabelAndStart(subject, 0);
      placement = {
        subject: subject as any,
        ability: 0,
        label,
        recommendedGrade: grade,
        recommendedUnit: unit
      };
    }

    // Load manifest and skills data
    const manifestRes = await fetch(new URL('/content/manifest.json', request.url));
    const skillsRes = await fetch(new URL('/content/skills.json', request.url));

    if (!manifestRes.ok || !skillsRes.ok) {
      return NextResponse.json(
        { error: 'Failed to load curriculum data' }, 
        { status: 500 }
      );
    }

    const manifest: Manifest = await manifestRes.json();
    const skills: SkillGraph = await skillsRes.json();

    // Generate personalized learning plan
    const planItems = generatePlan(placement, manifest, skills);

    // In production, save to database
    // For now, return the items to be saved to localStorage by client
    const response = {
      planItems,
      placement,
      generated_at: new Date().toISOString(),
      subject
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning plan' }, 
      { status: 500 }
    );
  }
}
