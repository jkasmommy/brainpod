import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Parse CSV data
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && (i === 0 || line[i-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

// Build activity JSON for practice/quiz rows
function buildActivityJSON(row: any): any {
  const activityType = row.activity_type?.toLowerCase();
  
  if (activityType === 'practice' || activityType === 'quiz') {
    return {
      blocks: [
        {
          type: 'practice',
          items: [
            {
              id: `item_${row.lesson_id || 'unknown'}_${Date.now()}`,
              type: 'mcq',
              stem: row.question_stem || row.instruction || '',
              choices: [
                row.choice_a || '',
                row.choice_b || '',
                row.choice_c || '',
                row.choice_d || ''
              ].filter(choice => choice.trim() !== ''),
              correctAnswer: parseInt(row.correct_answer || '0') || 0,
              explanation: row.explanation || '',
              difficulty: parseFloat(row.difficulty || '0') || 0,
              estimatedTime: parseInt(row.estimated_time || '60') || 60
            }
          ]
        }
      ]
    };
  }
  
  if (activityType === 'instruction') {
    return {
      blocks: [
        {
          type: 'instruction',
          markdown: row.instruction || row.content || '',
          estimatedTime: parseInt(row.estimated_time || '120') || 120
        }
      ]
    };
  }
  
  return {
    blocks: [
      {
        type: 'instruction',
        markdown: row.content || row.instruction || 'Content coming soon...',
        estimatedTime: parseInt(row.estimated_time || '60') || 60
      }
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const importSecret = request.headers.get('x-import-secret');
    if (!importSecret || importSecret !== process.env.CONTENT_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read and parse CSV content
    const csvContent = await file.text();
    const rows = parseCSV(csvContent);

    console.log(`Processing ${rows.length} rows from CSV`);

    // Group data by subject/course/unit/lesson
    const subjects = new Map();
    const courses = new Map();
    const units = new Map();
    const lessons = new Map();
    const activities = new Map();
    const skills = new Map();
    const standards = new Map();

    // Process each row
    for (const row of rows) {
      // Subject
      if (row.subject_id && row.subject_title) {
        subjects.set(row.subject_id, {
          id: row.subject_id,
          title: row.subject_title,
          description: row.subject_description || '',
          icon: row.subject_icon || 'book',
          color: row.subject_color || '#3B82F6'
        });
      }

      // Course
      if (row.course_id && row.course_title) {
        courses.set(row.course_id, {
          id: row.course_id,
          subject_id: row.subject_id,
          title: row.course_title,
          description: row.course_description || '',
          grade_level: row.grade_level || 'K',
          sequence_order: parseInt(row.course_sequence || '1') || 1
        });
      }

      // Unit
      if (row.unit_id && row.unit_title) {
        units.set(row.unit_id, {
          id: row.unit_id,
          course_id: row.course_id,
          title: row.unit_title,
          description: row.unit_description || '',
          sequence_order: parseInt(row.unit_sequence || '1') || 1,
          estimated_duration: parseInt(row.unit_duration || '60') || 60
        });
      }

      // Lesson
      if (row.lesson_id && row.lesson_title) {
        lessons.set(row.lesson_id, {
          id: row.lesson_id,
          unit_id: row.unit_id,
          title: row.lesson_title,
          description: row.lesson_description || '',
          sequence_order: parseInt(row.lesson_sequence || '1') || 1,
          estimated_duration: parseInt(row.lesson_duration || '30') || 30,
          difficulty: parseFloat(row.lesson_difficulty || '0') || 0,
          learning_objectives: row.learning_objectives ? [row.learning_objectives] : []
        });
      }

      // Activity
      if (row.activity_id && row.activity_type) {
        activities.set(row.activity_id, {
          id: row.activity_id,
          lesson_id: row.lesson_id,
          title: row.activity_title || `${row.activity_type} Activity`,
          type: row.activity_type.toLowerCase(),
          sequence_order: parseInt(row.activity_sequence || '1') || 1,
          estimated_duration: parseInt(row.estimated_time || '60') || 60,
          content: buildActivityJSON(row)
        });
      }

      // Skill
      if (row.skill_id && row.skill_title) {
        skills.set(row.skill_id, {
          id: row.skill_id,
          title: row.skill_title,
          description: row.skill_description || '',
          subject_id: row.subject_id,
          grade_level: row.grade_level || 'K',
          category: row.skill_category || 'core'
        });
      }

      // Standard
      if (row.standard_id && row.standard_code) {
        standards.set(row.standard_id, {
          id: row.standard_id,
          code: row.standard_code,
          title: row.standard_title || '',
          description: row.standard_description || '',
          subject: row.subject_id || 'math',
          grade_level: row.grade_level || 'K',
          framework: row.standard_framework || 'CCSS'
        });
      }
    }

    // Upsert to database
    const results = {
      subjects: 0,
      courses: 0,
      units: 0,
      lessons: 0,
      activities: 0,
      skills: 0,
      standards: 0,
      lesson_skills: 0,
      skill_standards: 0
    };

    // Insert subjects
    if (subjects.size > 0) {
      const { data, error } = await supabase
        .from('content_subjects')
        .upsert(Array.from(subjects.values()), { onConflict: 'id' });
      if (error) console.error('Subjects error:', error);
      else results.subjects = data?.length || subjects.size;
    }

    // Insert courses
    if (courses.size > 0) {
      const { data, error } = await supabase
        .from('content_courses')
        .upsert(Array.from(courses.values()), { onConflict: 'id' });
      if (error) console.error('Courses error:', error);
      else results.courses = data?.length || courses.size;
    }

    // Insert units
    if (units.size > 0) {
      const { data, error } = await supabase
        .from('content_units')
        .upsert(Array.from(units.values()), { onConflict: 'id' });
      if (error) console.error('Units error:', error);
      else results.units = data?.length || units.size;
    }

    // Insert lessons
    if (lessons.size > 0) {
      const { data, error } = await supabase
        .from('content_lessons')
        .upsert(Array.from(lessons.values()), { onConflict: 'id' });
      if (error) console.error('Lessons error:', error);
      else results.lessons = data?.length || lessons.size;
    }

    // Insert activities
    if (activities.size > 0) {
      const { data, error } = await supabase
        .from('content_activities')
        .upsert(Array.from(activities.values()), { onConflict: 'id' });
      if (error) console.error('Activities error:', error);
      else results.activities = data?.length || activities.size;
    }

    // Insert skills
    if (skills.size > 0) {
      const { data, error } = await supabase
        .from('content_skills')
        .upsert(Array.from(skills.values()), { onConflict: 'id' });
      if (error) console.error('Skills error:', error);
      else results.skills = data?.length || skills.size;
    }

    // Insert standards
    if (standards.size > 0) {
      const { data, error } = await supabase
        .from('content_standards')
        .upsert(Array.from(standards.values()), { onConflict: 'id' });
      if (error) console.error('Standards error:', error);
      else results.standards = data?.length || standards.size;
    }

    // Process lesson-skill relationships
    const lessonSkills = new Set();
    for (const row of rows) {
      if (row.lesson_id && row.skill_id) {
        lessonSkills.add({
          lesson_id: row.lesson_id,
          skill_id: row.skill_id
        });
      }
    }

    if (lessonSkills.size > 0) {
      const { data, error } = await supabase
        .from('content_lesson_skills')
        .upsert(Array.from(lessonSkills), { onConflict: 'lesson_id,skill_id' });
      if (error) console.error('Lesson-skills error:', error);
      else results.lesson_skills = data?.length || lessonSkills.size;
    }

    // Process skill-standard relationships
    const skillStandards = new Set();
    for (const row of rows) {
      if (row.skill_id && row.standard_id) {
        skillStandards.add({
          skill_id: row.skill_id,
          standard_id: row.standard_id
        });
      }
    }

    if (skillStandards.size > 0) {
      const { data, error } = await supabase
        .from('content_skill_standards')
        .upsert(Array.from(skillStandards), { onConflict: 'skill_id,standard_id' });
      if (error) console.error('Skill-standards error:', error);
      else results.skill_standards = data?.length || skillStandards.size;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported content from CSV`,
      results,
      totalRows: rows.length
    });

  } catch (error) {
    console.error('CSV Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
