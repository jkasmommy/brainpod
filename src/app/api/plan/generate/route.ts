import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '../../../../lib/plan';
import { Manifest, SkillGraph, Placement } from '../../../../lib/types';
import { abilityToLabelAndStart } from '../../../../lib/placementMaps';
import { SubjectKey, getLevel } from '../../../../lib/levels';

export async function POST(request: NextRequest) {
  try {
    const { subject } = await request.json();

    if (!subject || !(['math', 'reading', 'science', 'social-studies'] as SubjectKey[]).includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject provided' }, 
        { status: 400 }
      );
    }

    // Try to get placement from level record first, then fallback to headers
    let placement: Placement;
    
    // Check if we have a level record (this would come from the client in a real app)
    const placementHeader = request.headers.get('x-placement-data');
    
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

    // Load manifest and skills data from public content directory
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : request.url.replace(/\/api\/.*$/, '');
      
    const manifestRes = await fetch(`${baseUrl}/content/manifest.json`);
    const skillsRes = await fetch(`${baseUrl}/content/skills.json`);

    if (!manifestRes.ok || !skillsRes.ok) {
      console.error('Failed to load curriculum data:', {
        manifest: manifestRes.status,
        skills: skillsRes.status
      });
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
