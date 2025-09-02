/**
 * BrainPod Content Import API Route
 * 
 * Imports content from static JSON files into Supabase content database.
 * This route is guarded by CONTENT_IMPORT_SECRET and uses service role permissions.
 * 
 * Usage:
 * 1. Set CONTENT_IMPORT_SECRET in environment variables
 * 2. Set SUPABASE_SERVICE_ROLE_KEY for admin access
 * 3. POST to /api/content/import with header: x-import-secret: <your-secret>
 * 4. Optional: Include ?dry_run=true to see what would be imported without making changes
 * 
 * This route scans:
 * - public/content/manifest.json for curriculum structure
 * - public/content/skills.json for skill prerequisites  
 * - public/content/diagnostic/*.json for diagnostic question banks
 * - Hardcoded question arrays in components (KinderCountingDemo, etc.)
 * 
 * Example:
 * curl -X POST http://localhost:3001/api/content/import \
 *   -H "x-import-secret: your-secret-key" \
 *   -H "Content-Type: application/json"
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { 
  LegacyManifest, 
  LegacySkills, 
  ContentSubject,
  ContentCourse,
  ContentUnit,
  ContentLesson,
  ContentSkill,
  ContentStandard,
  ActivityContent,
  DiagnosticForm,
  DiagnosticItem,
  PromptTemplate
} from '@/lib/contentTypes';

// Force dynamic rendering (required for server-side file access)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ImportStats {
  subjects: number;
  courses: number;
  units: number;
  lessons: number;
  skills: number;
  standards: number;
  activities: number;
  diagnostic_forms: number;
  diagnostic_items: number;
  prompts: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const stats: ImportStats = {
    subjects: 0, courses: 0, units: 0, lessons: 0, skills: 0, 
    standards: 0, activities: 0, diagnostic_forms: 0, 
    diagnostic_items: 0, prompts: 0, errors: []
  };

  try {
    // 1. Verify import secret
    const importSecret = request.headers.get('x-import-secret');
    const expectedSecret = process.env.CONTENT_IMPORT_SECRET;
    
    if (!importSecret || !expectedSecret || importSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing import secret' },
        { status: 401 }
      );
    }

    // 2. Check for dry run mode
    const url = new URL(request.url);
    const isDryRun = url.searchParams.get('dry_run') === 'true';

    // 3. Initialize Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log(`🚀 Starting content import${isDryRun ? ' (DRY RUN)' : ''}`);

    // 4. Load static content files
    const manifest = await loadManifest();
    const skills = await loadSkills();
    const diagnosticBanks = await loadDiagnosticBanks();
    const hardcodedContent = await extractHardcodedContent();

    // 5. Import content in dependency order
    await importSubjects(supabase, manifest, stats, isDryRun);
    await importCourses(supabase, manifest, stats, isDryRun);
    await importUnits(supabase, manifest, stats, isDryRun);
    await importLessons(supabase, manifest, stats, isDryRun);
    await importSkills(supabase, skills, manifest, stats, isDryRun);
    await importStandards(supabase, manifest, stats, isDryRun);
    await importActivities(supabase, manifest, hardcodedContent, stats, isDryRun);
    await importDiagnostics(supabase, diagnosticBanks, stats, isDryRun);
    await importPrompts(supabase, hardcodedContent, stats, isDryRun);

    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      dry_run: isDryRun,
      duration_ms: duration,
      stats,
      message: isDryRun 
        ? 'Dry run completed - no changes made to database'
        : 'Content import completed successfully'
    });

  } catch (error) {
    console.error('Content import error:', error);
    stats.errors.push(error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json({
      success: false,
      error: 'Import failed',
      stats,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================================
// CONTENT LOADING FUNCTIONS
// ============================================================================

async function loadManifest(): Promise<LegacyManifest> {
  try {
    const filePath = join(process.cwd(), 'public/content/manifest.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load manifest.json: ${error}`);
  }
}

async function loadSkills(): Promise<LegacySkills> {
  try {
    const filePath = join(process.cwd(), 'public/content/skills.json');
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load skills.json: ${error}`);
  }
}

async function loadDiagnosticBanks(): Promise<Record<string, any[]>> {
  const banks: Record<string, any[]> = {};
  const subjects = ['math', 'reading', 'science', 'social-studies'];
  
  for (const subject of subjects) {
    try {
      const filePath = join(process.cwd(), `public/content/diagnostic/${subject}-v1.json`);
      const content = readFileSync(filePath, 'utf-8');
      banks[subject] = JSON.parse(content);
    } catch (error) {
      console.warn(`Could not load ${subject} diagnostic bank: ${error}`);
      banks[subject] = [];
    }
  }
  
  return banks;
}

async function extractHardcodedContent(): Promise<any> {
  // TODO: Scan component files for hardcoded questions/prompts
  // For now, return empty structure
  return {
    components: {},
    prompts: {
      global: {
        encouragement: [
          'Great job! Keep up the excellent work!',
          'You\'re doing amazing! Take a deep breath and continue.',
          'Wonderful progress! Remember to stay mindful and focused.'
        ],
        hints: {
          math: 'Think step by step. What do you know? What are you trying to find?',
          reading: 'Read the passage carefully. Look for key words and phrases.',
          science: 'Consider what you observe. What patterns do you notice?'
        }
      }
    }
  };
}

// ============================================================================
// DATABASE IMPORT FUNCTIONS
// ============================================================================

async function importSubjects(
  supabase: any, 
  manifest: LegacyManifest, 
  stats: ImportStats, 
  isDryRun: boolean
) {
  const subjects: ContentSubject[] = [
    { id: 'math', title: 'Mathematics', description: 'Number sense, operations, algebra, geometry, and data analysis' },
    { id: 'reading', title: 'Reading & Language Arts', description: 'Phonics, fluency, comprehension, and writing' },
    { id: 'science', title: 'Science', description: 'Physical, life, earth, and space sciences' },
    { id: 'social-studies', title: 'Social Studies', description: 'History, geography, civics, and economics' }
  ];

  if (!isDryRun) {
    const { error } = await supabase
      .from('content_subjects')
      .upsert(subjects, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to import subjects: ${error.message}`);
    }
  }

  stats.subjects = subjects.length;
  console.log(`📚 ${isDryRun ? 'Would import' : 'Imported'} ${subjects.length} subjects`);
}

async function importCourses(
  supabase: any,
  manifest: LegacyManifest,
  stats: ImportStats,
  isDryRun: boolean
) {
  const courses: ContentCourse[] = [];

  for (const [subjectId, subjectData] of Object.entries(manifest)) {
    for (const [gradeId, gradeData] of Object.entries(subjectData)) {
      const course: ContentCourse = {
        id: gradeId,
        subject_id: subjectId,
        type: gradeId === 'HS' ? 'course' : 'grade',
        title: gradeId === 'K' ? 'Kindergarten' : gradeId === 'HS' ? 'High School' : `Grade ${gradeId}`,
        short_title: gradeId,
        order_index: gradeId === 'K' ? 0 : gradeId === 'HS' ? 13 : parseInt(gradeId)
      };
      courses.push(course);
    }
  }

  if (!isDryRun) {
    const { error } = await supabase
      .from('content_courses')
      .upsert(courses, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to import courses: ${error.message}`);
    }
  }

  stats.courses = courses.length;
  console.log(`🎓 ${isDryRun ? 'Would import' : 'Imported'} ${courses.length} courses`);
}

async function importUnits(
  supabase: any,
  manifest: LegacyManifest,
  stats: ImportStats,
  isDryRun: boolean
) {
  const units: ContentUnit[] = [];

  for (const [subjectId, subjectData] of Object.entries(manifest)) {
    for (const [gradeId, gradeData] of Object.entries(subjectData)) {
      let unitIndex = 0;
      for (const [unitSlug, unitData] of Object.entries(gradeData)) {
        const unit: ContentUnit = {
          id: crypto.randomUUID(),
          subject_id: subjectId,
          course_id: gradeId,
          slug: unitSlug,
          title: unitData.title,
          description: unitData.description,
          order_index: unitIndex++
        };
        units.push(unit);
      }
    }
  }

  if (!isDryRun) {
    const { error } = await supabase
      .from('content_units')
      .upsert(units, { onConflict: 'subject_id,course_id,slug' });

    if (error) {
      throw new Error(`Failed to import units: ${error.message}`);
    }
  }

  stats.units = units.length;
  console.log(`📖 ${isDryRun ? 'Would import' : 'Imported'} ${units.length} units`);
}

async function importLessons(
  supabase: any,
  manifest: LegacyManifest,
  stats: ImportStats,
  isDryRun: boolean
) {
  // First, get unit IDs from database (or generate if dry run)
  const unitMap = new Map<string, string>();
  
  if (!isDryRun) {
    const { data: units, error } = await supabase
      .from('content_units')
      .select('id, subject_id, course_id, slug');

    if (error) {
      throw new Error(`Failed to fetch units: ${error.message}`);
    }

    for (const unit of units) {
      const key = `${unit.subject_id}-${unit.course_id}-${unit.slug}`;
      unitMap.set(key, unit.id);
    }
  }

  const lessons: ContentLesson[] = [];

  for (const [subjectId, subjectData] of Object.entries(manifest)) {
    for (const [gradeId, gradeData] of Object.entries(subjectData)) {
      for (const [unitSlug, unitData] of Object.entries(gradeData)) {
        const unitKey = `${subjectId}-${gradeId}-${unitSlug}`;
        const unitId = unitMap.get(unitKey) || crypto.randomUUID();

        for (const lessonData of unitData.lessons) {
          const lesson: ContentLesson = {
            id: lessonData.id,
            unit_id: unitId,
            title: lessonData.title,
            minutes: lessonData.minutes || 10,
            difficulty: lessonData.difficulty || 0.0,
            summary: `${lessonData.title} - ${lessonData.skills?.join(', ') || 'Practice lesson'}`
          };
          lessons.push(lesson);
        }
      }
    }
  }

  if (!isDryRun) {
    const { error } = await supabase
      .from('content_lessons')
      .upsert(lessons, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to import lessons: ${error.message}`);
    }
  }

  stats.lessons = lessons.length;
  console.log(`📝 ${isDryRun ? 'Would import' : 'Imported'} ${lessons.length} lessons`);
}

async function importSkills(
  supabase: any,
  skills: LegacySkills,
  manifest: LegacyManifest,
  stats: ImportStats,
  isDryRun: boolean
) {
  // Extract skills from manifest and create skill records
  const skillsSet = new Set<string>();
  const subjectSkills = new Map<string, string>();

  // Collect all skills from lessons
  for (const [subjectId, subjectData] of Object.entries(manifest)) {
    for (const [gradeId, gradeData] of Object.entries(subjectData)) {
      for (const [unitSlug, unitData] of Object.entries(gradeData)) {
        for (const lesson of unitData.lessons) {
          for (const skillId of lesson.skills || []) {
            skillsSet.add(skillId);
            subjectSkills.set(skillId, subjectId);
          }
        }
      }
    }
  }

  // Create skill records
  const skillRecords: ContentSkill[] = Array.from(skillsSet).map(skillId => ({
    id: skillId,
    subject_id: subjectSkills.get(skillId) || 'math',
    title: skillId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `Learning objective: ${skillId}`
  }));

  if (!isDryRun) {
    const { error } = await supabase
      .from('content_skills')
      .upsert(skillRecords, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to import skills: ${error.message}`);
    }

    // Import skill prerequisites
    const prereqs = [];
    for (const [skillId, prereqIds] of Object.entries(skills)) {
      for (const prereqId of prereqIds) {
        prereqs.push({
          skill_id: skillId,
          prereq_skill_id: prereqId
        });
      }
    }

    if (prereqs.length > 0) {
      const { error: prereqError } = await supabase
        .from('content_skill_prereqs')
        .upsert(prereqs, { onConflict: 'skill_id,prereq_skill_id' });

      if (prereqError) {
        throw new Error(`Failed to import skill prerequisites: ${prereqError.message}`);
      }
    }
  }

  stats.skills = skillRecords.length;
  console.log(`🎯 ${isDryRun ? 'Would import' : 'Imported'} ${skillRecords.length} skills`);
}

async function importStandards(
  supabase: any,
  manifest: LegacyManifest,
  stats: ImportStats,
  isDryRun: boolean
) {
  const standardsSet = new Set<string>();

  // Collect all standards from lessons
  for (const [subjectId, subjectData] of Object.entries(manifest)) {
    for (const [gradeId, gradeData] of Object.entries(subjectData)) {
      for (const [unitSlug, unitData] of Object.entries(gradeData)) {
        for (const lesson of unitData.lessons) {
          for (const standardCode of lesson.standards || []) {
            standardsSet.add(standardCode);
          }
        }
      }
    }
  }

  const standards: ContentStandard[] = Array.from(standardsSet).map(code => {
    let framework = 'CCSS-M'; // Default
    if (code.includes('HS-')) framework = 'NGSS';
    if (code.includes('D2.')) framework = 'C3';
    if (code.includes('RF.') || code.includes('RL.')) framework = 'CCSS-ELA';

    return {
      code,
      framework,
      title: `Standard ${code}`,
      description: `Learning standard: ${code}`
    };
  });

  if (!isDryRun) {
    const { error } = await supabase
      .from('content_standards')
      .upsert(standards, { onConflict: 'code' });

    if (error) {
      throw new Error(`Failed to import standards: ${error.message}`);
    }
  }

  stats.standards = standards.length;
  console.log(`📋 ${isDryRun ? 'Would import' : 'Imported'} ${standards.length} standards`);
}

async function importActivities(
  supabase: any,
  manifest: LegacyManifest,
  hardcodedContent: any,
  stats: ImportStats,
  isDryRun: boolean
) {
  // Create basic activities for each lesson (instruction + practice)
  const activities = [];

  for (const [subjectId, subjectData] of Object.entries(manifest)) {
    for (const [gradeId, gradeData] of Object.entries(subjectData)) {
      for (const [unitSlug, unitData] of Object.entries(gradeData)) {
        for (const lesson of unitData.lessons) {
          // Instruction activity
          const instructionContent: ActivityContent = {
            schema: 1,
            blocks: [{
              type: 'instruction',
              markdown: `# ${lesson.title}\n\nWelcome to this lesson on ${lesson.title}. Let's learn together!`
            }]
          };

          activities.push({
            id: crypto.randomUUID(),
            lesson_id: lesson.id,
            kind: 'instruction',
            content: instructionContent,
            order_index: 0
          });

          // Practice activity with sample MCQ
          const practiceContent: ActivityContent = {
            schema: 1,
            blocks: [{
              type: 'practice',
              items: [{
                type: 'mcq',
                stem: `Practice question for ${lesson.title}`,
                choices: ['Option A', 'Option B', 'Option C'],
                answer: 'Option A',
                explanation: 'This is the correct answer because...',
                skill_id: lesson.skills?.[0],
                difficulty: lesson.difficulty
              }]
            }]
          };

          activities.push({
            id: crypto.randomUUID(),
            lesson_id: lesson.id,
            kind: 'practice',
            content: practiceContent,
            order_index: 1
          });
        }
      }
    }
  }

  if (!isDryRun) {
    const { error } = await supabase
      .from('content_activities')
      .upsert(activities);

    if (error) {
      throw new Error(`Failed to import activities: ${error.message}`);
    }
  }

  stats.activities = activities.length;
  console.log(`🎪 ${isDryRun ? 'Would import' : 'Imported'} ${activities.length} activities`);
}

async function importDiagnostics(
  supabase: any,
  diagnosticBanks: Record<string, any[]>,
  stats: ImportStats,
  isDryRun: boolean
) {
  const forms: any[] = [];
  const items: any[] = [];

  for (const [subject, bank] of Object.entries(diagnosticBanks)) {
    if (bank.length === 0) continue;

    // Create diagnostic form
    const formId = `${subject}-diagnostic`;
    forms.push({
      id: formId,
      subject_id: subject,
      label: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Diagnostic`,
      description: `Adaptive diagnostic assessment for ${subject}`,
      meta: {
        min_items: 5,
        max_items: 20,
        target_precision: 0.3,
        adaptive: true
      }
    });

    // Import diagnostic items
    bank.forEach((item, index) => {
      items.push({
        id: crypto.randomUUID(),
        form_id: formId,
        external_id: item.id,
        order_index: index,
        item: item
      });
    });
  }

  if (!isDryRun) {
    if (forms.length > 0) {
      const { error: formsError } = await supabase
        .from('content_diagnostic_forms')
        .upsert(forms, { onConflict: 'id' });

      if (formsError) {
        throw new Error(`Failed to import diagnostic forms: ${formsError.message}`);
      }
    }

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('content_diagnostic_items')
        .upsert(items);

      if (itemsError) {
        throw new Error(`Failed to import diagnostic items: ${itemsError.message}`);
      }
    }
  }

  stats.diagnostic_forms = forms.length;
  stats.diagnostic_items = items.length;
  console.log(`🔍 ${isDryRun ? 'Would import' : 'Imported'} ${forms.length} diagnostic forms, ${items.length} items`);
}

async function importPrompts(
  supabase: any,
  hardcodedContent: any,
  stats: ImportStats,
  isDryRun: boolean
) {
  const prompts: PromptTemplate[] = [];

  // Global encouragement prompts
  hardcodedContent.prompts.global.encouragement.forEach((text: string, index: number) => {
    prompts.push({
      id: crypto.randomUUID(),
      scope: 'global',
      ref_id: undefined,
      version: 1,
      name: 'encouragement',
      template: text,
      meta: { variables: ['student_name'] }
    });
  });

  // Subject-specific hint prompts
  Object.entries(hardcodedContent.prompts.global.hints).forEach(([subject, hint]) => {
    prompts.push({
      id: crypto.randomUUID(),
      scope: 'global',
      ref_id: subject,
      version: 1,
      name: 'hint_template',
      template: hint as string,
      meta: { variables: ['question', 'skill'] }
    });
  });

  if (!isDryRun && prompts.length > 0) {
    const { error } = await supabase
      .from('content_prompt_templates')
      .upsert(prompts);

    if (error) {
      throw new Error(`Failed to import prompts: ${error.message}`);
    }
  }

  stats.prompts = prompts.length;
  console.log(`💬 ${isDryRun ? 'Would import' : 'Imported'} ${prompts.length} prompt templates`);
}
