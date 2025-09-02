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
        subject: subject,
        ability: 0,
        label,
        recommendedGrade: grade,
        recommendedUnit: unit
      };
    }

    // Load manifest and skills data from public content directory
    let manifest: Manifest;
    let skills: SkillGraph;
    
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : `https://${request.headers.get('host')}`;
        
      const manifestRes = await fetch(`${baseUrl}/content/manifest.json`);
      const skillsRes = await fetch(`${baseUrl}/content/skills.json`);

      if (!manifestRes.ok || !skillsRes.ok) {
        console.error('Failed to load curriculum data:', {
          manifest: manifestRes.status,
          skills: skillsRes.status,
          baseUrl
        });
        throw new Error('Failed to fetch curriculum data');
      }

      manifest = await manifestRes.json();
      skills = await skillsRes.json();
    } catch (fetchError) {
      console.error('Error fetching curriculum data:', fetchError);
      
      // Fallback: Use minimal mock data for testing
      manifest = {
        [subject]: {
          'grade-k': {
            'counting-basics': {
              title: 'Counting Basics',
              lessons: [
                { 
                  id: 'counting-1-10', 
                  title: 'Counting 1-10',
                  skills: ['counting', 'number-recognition'], 
                  minutes: 15,
                  difficulty: 1
                },
                { 
                  id: 'counting-patterns', 
                  title: 'Counting Patterns',
                  skills: ['counting', 'patterns'], 
                  minutes: 20,
                  difficulty: 2
                }
              ]
            }
          }
        }
      };
      skills = {};
    }

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
