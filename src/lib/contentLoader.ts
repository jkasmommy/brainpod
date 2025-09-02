/**
 * BrainPod Enhanced Content Loader
 * 
 * Loads content from either static JSON files or Supabase database
 * based on NEXT_PUBLIC_FEATURE_CONTENT_DB feature flag.
 * 
 * This replaces the existing curriculum.ts loader with database support.
 */

import { createClient } from '@supabase/supabase-js';
import { isFeatureEnabled } from './flags';
import type {
  ContentSubject,
  ContentCourse,
  ContentUnit,
  ContentLesson,
  ContentActivity,
  ContentSkill,
  ContentStandard,
  LessonWithActivities,
  UnitWithLessons,
  CourseWithUnits,
  SubjectContent,
  DiagnosticForm,
  DiagnosticItem,
  LegacyManifest
} from './contentTypes';

// Legacy types for backward compatibility
export interface LessonData {
  id: string;
  title: string;
  skills: string[];
  minutes: number;
  difficulty: number;
  standards: string[];
}

export interface UnitData {
  title: string;
  description?: string;
  lessons: LessonData[];
}

export interface ManifestData {
  [subject: string]: {
    [grade: string]: {
      [unit: string]: UnitData;
    };
  };
}

// ============================================================================
// MAIN CONTENT LOADING FUNCTIONS
// ============================================================================

/**
 * Get complete curriculum manifest (backward compatibility)
 */
export async function getManifest(): Promise<ManifestData> {
  if (isFeatureEnabled('contentFromDB')) {
    return await getManifestFromDB();
  } else {
    return await getManifestFromJSON();
  }
}

/**
 * Get lessons for a specific unit
 */
export async function getUnitLessons(
  subject: string, 
  grade: string, 
  unitSlug: string
): Promise<UnitWithLessons | null> {
  if (isFeatureEnabled('contentFromDB')) {
    return await getUnitLessonsFromDB(subject, grade, unitSlug);
  } else {
    return await getUnitLessonsFromJSON(subject, grade, unitSlug);
  }
}

/**
 * Get detailed lesson with activities
 */
export async function getLesson(lessonId: string): Promise<LessonWithActivities | null> {
  if (isFeatureEnabled('contentFromDB')) {
    return await getLessonFromDB(lessonId);
  } else {
    return await getLessonFromJSON(lessonId);
  }
}

/**
 * Get all content for a subject
 */
export async function getSubjectContent(subjectId: string): Promise<SubjectContent | null> {
  if (isFeatureEnabled('contentFromDB')) {
    return await getSubjectContentFromDB(subjectId);
  } else {
    return await getSubjectContentFromJSON(subjectId);
  }
}

/**
 * Get diagnostic questions for a subject
 */
export async function getDiagnosticItems(subject: string): Promise<any[]> {
  if (isFeatureEnabled('contentFromDB')) {
    return await getDiagnosticItemsFromDB(subject);
  } else {
    return await getDiagnosticItemsFromJSON(subject);
  }
}

// ============================================================================
// DATABASE CONTENT LOADING
// ============================================================================

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration for content loading');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

async function getManifestFromDB(): Promise<ManifestData> {
  const supabase = getSupabaseClient();
  
  // Get all content in a single query with joins
  const { data: subjects, error } = await supabase
    .from('content_subjects')
    .select(`
      id,
      title,
      content_courses (
        id,
        title,
        short_title,
        order_index,
        content_units (
          id,
          slug,
          title,
          description,
          order_index,
          content_lessons (
            id,
            title,
            minutes,
            difficulty,
            content_lesson_skills (
              content_skills (id, title)
            )
          )
        )
      )
    `)
    .order('id');

  if (error) {
    console.error('Error loading content from database:', error);
    throw new Error(`Failed to load content: ${error.message}`);
  }

  // Transform database structure to legacy manifest format
  const manifest: ManifestData = {};

  for (const subject of subjects || []) {
    manifest[subject.id] = {};
    
    for (const course of subject.content_courses || []) {
      manifest[subject.id][course.id] = {};
      
      for (const unit of course.content_units || []) {
        const lessons: LessonData[] = (unit.content_lessons || []).map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          minutes: lesson.minutes,
          difficulty: lesson.difficulty,
          skills: (lesson.content_lesson_skills || []).map((ls: any) => ls.content_skills.id),
          standards: [] // TODO: Add standards join
        }));

        manifest[subject.id][course.id][unit.slug] = {
          title: unit.title,
          description: unit.description,
          lessons
        };
      }
    }
  }

  return manifest;
}

async function getUnitLessonsFromDB(
  subject: string, 
  grade: string, 
  unitSlug: string
): Promise<UnitWithLessons | null> {
  const supabase = getSupabaseClient();
  
  const { data: unit, error } = await supabase
    .from('content_units')
    .select(`
      *,
      content_lessons (
        id,
        title,
        minutes,
        difficulty,
        summary
      )
    `)
    .eq('subject_id', subject)
    .eq('course_id', grade)
    .eq('slug', unitSlug)
    .single();

  if (error || !unit) {
    console.error('Error loading unit from database:', error);
    return null;
  }

  return {
    unit: {
      id: unit.id,
      subject_id: unit.subject_id,
      course_id: unit.course_id,
      slug: unit.slug,
      title: unit.title,
      description: unit.description,
      order_index: unit.order_index
    },
    lessons: unit.content_lessons || []
  };
}

async function getLessonFromDB(lessonId: string): Promise<LessonWithActivities | null> {
  const supabase = getSupabaseClient();
  
  const { data: lesson, error } = await supabase
    .from('content_lessons')
    .select(`
      *,
      content_activities (*),
      content_lesson_skills (
        content_skills (*)
      )
    `)
    .eq('id', lessonId)
    .single();

  if (error || !lesson) {
    console.error('Error loading lesson from database:', error);
    return null;
  }

  return {
    lesson: {
      id: lesson.id,
      unit_id: lesson.unit_id,
      title: lesson.title,
      minutes: lesson.minutes,
      difficulty: lesson.difficulty,
      summary: lesson.summary
    },
    activities: lesson.content_activities || [],
    skills: (lesson.content_lesson_skills || []).map((ls: any) => ls.content_skills),
    standards: [] // TODO: Add standards lookup
  };
}

async function getSubjectContentFromDB(subjectId: string): Promise<SubjectContent | null> {
  const supabase = getSupabaseClient();
  
  const { data: subject, error } = await supabase
    .from('content_subjects')
    .select(`
      *,
      content_courses (
        *,
        content_units (*)
      )
    `)
    .eq('id', subjectId)
    .single();

  if (error || !subject) {
    console.error('Error loading subject from database:', error);
    return null;
  }

  const courses: CourseWithUnits[] = (subject.content_courses || []).map((course: any) => ({
    course: {
      id: course.id,
      subject_id: course.subject_id,
      type: course.type,
      title: course.title,
      short_title: course.short_title,
      order_index: course.order_index
    },
    units: course.content_units || []
  }));

  return {
    subject: {
      id: subject.id,
      title: subject.title,
      description: subject.description
    },
    courses
  };
}

async function getDiagnosticItemsFromDB(subject: string): Promise<any[]> {
  const supabase = getSupabaseClient();
  
  const { data: items, error } = await supabase
    .from('content_diagnostic_items')
    .select(`
      *,
      content_diagnostic_forms!inner (subject_id)
    `)
    .eq('content_diagnostic_forms.subject_id', subject)
    .order('order_index');

  if (error) {
    console.error('Error loading diagnostic items from database:', error);
    return [];
  }

  return (items || []).map(item => item.item);
}

// ============================================================================
// JSON FILE CONTENT LOADING (LEGACY)
// ============================================================================

async function getManifestFromJSON(): Promise<ManifestData> {
  try {
    const response = await fetch('/content/manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading manifest from JSON:', error);
    throw error;
  }
}

async function getUnitLessonsFromJSON(
  subject: string, 
  grade: string, 
  unitSlug: string
): Promise<UnitWithLessons | null> {
  const manifest = await getManifestFromJSON();
  const unitData = manifest[subject]?.[grade]?.[unitSlug];
  
  if (!unitData) {
    return null;
  }

  const unit: ContentUnit = {
    id: `${subject}-${grade}-${unitSlug}`,
    subject_id: subject,
    course_id: grade,
    slug: unitSlug,
    title: unitData.title,
    description: unitData.description,
    order_index: 0
  };

  const lessons: ContentLesson[] = unitData.lessons.map(lesson => ({
    id: lesson.id,
    unit_id: unit.id,
    title: lesson.title,
    minutes: lesson.minutes,
    difficulty: lesson.difficulty,
    summary: lesson.title
  }));

  return { unit, lessons };
}

async function getLessonFromJSON(lessonId: string): Promise<LessonWithActivities | null> {
  const manifest = await getManifestFromJSON();
  
  // Find lesson in manifest
  for (const [subjectId, subjectData] of Object.entries(manifest)) {
    for (const [gradeId, gradeData] of Object.entries(subjectData)) {
      for (const [unitSlug, unitData] of Object.entries(gradeData)) {
        const lessonData = unitData.lessons.find(l => l.id === lessonId);
        if (lessonData) {
          const lesson: ContentLesson = {
            id: lessonData.id,
            unit_id: `${subjectId}-${gradeId}-${unitSlug}`,
            title: lessonData.title,
            minutes: lessonData.minutes,
            difficulty: lessonData.difficulty,
            summary: lessonData.title
          };

          // Create basic activities (this would be enhanced with real content)
          const activities: ContentActivity[] = [
            {
              id: `${lessonId}-instruction`,
              lesson_id: lessonId,
              kind: 'instruction',
              content: {
                schema: 1,
                blocks: [{
                  type: 'instruction',
                  markdown: `# ${lessonData.title}\n\nWelcome to this lesson!`
                }]
              },
              order_index: 0
            }
          ];

          const skills: ContentSkill[] = lessonData.skills.map(skillId => ({
            id: skillId,
            subject_id: subjectId,
            title: skillId.replace(/_/g, ' '),
            description: `Skill: ${skillId}`
          }));

          const standards: ContentStandard[] = lessonData.standards.map(code => ({
            code,
            framework: 'CCSS-M',
            title: `Standard ${code}`
          }));

          return { lesson, activities, skills, standards };
        }
      }
    }
  }

  return null;
}

async function getSubjectContentFromJSON(subjectId: string): Promise<SubjectContent | null> {
  const manifest = await getManifestFromJSON();
  const subjectData = manifest[subjectId];
  
  if (!subjectData) {
    return null;
  }

  const subject: ContentSubject = {
    id: subjectId,
    title: subjectId.charAt(0).toUpperCase() + subjectId.slice(1),
    description: `${subjectId} curriculum content`
  };

  const courses: CourseWithUnits[] = Object.entries(subjectData).map(([gradeId, gradeData]) => {
    const course: ContentCourse = {
      id: gradeId,
      subject_id: subjectId,
      type: gradeId === 'HS' ? 'course' : 'grade',
      title: gradeId === 'K' ? 'Kindergarten' : `Grade ${gradeId}`,
      short_title: gradeId,
      order_index: gradeId === 'K' ? 0 : parseInt(gradeId) || 13
    };

    const units: ContentUnit[] = Object.entries(gradeData).map(([unitSlug, unitData], index) => ({
      id: `${subjectId}-${gradeId}-${unitSlug}`,
      subject_id: subjectId,
      course_id: gradeId,
      slug: unitSlug,
      title: unitData.title,
      description: unitData.description,
      order_index: index
    }));

    return { course, units };
  });

  return { subject, courses };
}

async function getDiagnosticItemsFromJSON(subject: string): Promise<any[]> {
  try {
    const response = await fetch(`/content/diagnostic/${subject}-v1.json`);
    if (!response.ok) {
      console.warn(`No diagnostic bank found for ${subject}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${subject} diagnostic bank:`, error);
    return [];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if content database is available and populated
 */
export async function isContentDBReady(): Promise<boolean> {
  if (!isFeatureEnabled('contentFromDB')) {
    return false;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('content_subjects')
      .select('id')
      .limit(1);

    return !error && data && data.length > 0;
  } catch (error) {
    console.error('Error checking content database:', error);
    return false;
  }
}

/**
 * Get content loading status for debugging
 */
export async function getContentStatus() {
  const flags = {
    contentFromDB: isFeatureEnabled('contentFromDB')
  };

  const status = {
    flags,
    source: flags.contentFromDB ? 'database' : 'json',
    dbReady: flags.contentFromDB ? await isContentDBReady() : null
  };

  return status;
}

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Re-export types and functions that existing code depends on
export { GRADE_LEVELS, getPersonalizedCurriculum } from './curriculum';
export type { StudentProgress } from './curriculum';
