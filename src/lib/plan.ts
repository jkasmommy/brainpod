import { Manifest, SkillGraph, Placement, PlanItem } from './types';

/**
 * Generate a personalized learning plan from diagnostic placement
 * Uses data-driven rules to create adaptive learning pathways
 */
export function generatePlan(
  placement: Placement, 
  manifest: Manifest, 
  skills: SkillGraph
): PlanItem[] {
  const planItems: PlanItem[] = [];
  const today = new Date();
  let priority = 1;

  const subjectData = manifest[placement.subject];
  if (!subjectData) return planItems;

  const gradeData = subjectData[placement.recommendedGrade];
  if (!gradeData) return planItems;

  // Get target unit from placement
  const targetUnit = placement.recommendedUnit;
  if (!targetUnit || !gradeData[targetUnit]) return planItems;

  const unitData = gradeData[targetUnit];
  
  // Rule 1: If label starts with "Remediate" → add 2 prerequisite lessons
  if (placement.label.startsWith("Remediate")) {
    const prereqLessons = findPrerequisiteLessons(unitData.lessons, skills, manifest, placement.subject, 2);
    prereqLessons.forEach((lesson, index) => {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + index);
      
      planItems.push({
        lessonId: lesson.id,
        skills: lesson.skills,
        scheduled_for: scheduleDate.toISOString().split('T')[0],
        status: "todo",
        priority: priority++
      });
    });
  }

  // Rule 2: Always add 2 core lessons from target unit
  const coreLessons = unitData.lessons.slice(0, 2);
  coreLessons.forEach((lesson, index) => {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(today.getDate() + planItems.length + index);
    
    planItems.push({
      lessonId: lesson.id,
      skills: lesson.skills,
      scheduled_for: scheduleDate.toISOString().split('T')[0],
      status: "todo",
      priority: priority++
    });
  });

  // Rule 3: Add 1 spiral review from previous unit
  const previousUnit = findPreviousUnit(gradeData, targetUnit);
  if (previousUnit) {
    const reviewLesson = previousUnit.lessons[0]; // Take first lesson as review
    if (reviewLesson) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + planItems.length);
      
      planItems.push({
        lessonId: reviewLesson.id,
        skills: reviewLesson.skills,
        scheduled_for: scheduleDate.toISOString().split('T')[0],
        status: "todo",
        priority: priority++
      });
    }
  }

  // Rule 4: If label contains "enrichment" or "Accelerate" → add 1 enrichment lesson
  if (placement.label.includes("enrichment") || placement.label.includes("Accelerate")) {
    const enrichmentLesson = findEnrichmentLesson(unitData.lessons, placement.ability);
    if (enrichmentLesson) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(today.getDate() + planItems.length);
      
      planItems.push({
        lessonId: enrichmentLesson.id,
        skills: enrichmentLesson.skills,
        scheduled_for: scheduleDate.toISOString().split('T')[0],
        status: "todo",
        priority: priority++
      });
    }
  }

  return planItems;
}

/**
 * Find prerequisite lessons by walking the skill graph backwards
 */
function findPrerequisiteLessons(
  lessons: any[], 
  skills: SkillGraph, 
  manifest: Manifest, 
  subject: string, 
  count: number
): any[] {
  const prereqLessons: any[] = [];
  
  // Get all skills from current lessons
  const currentSkills = lessons.flatMap(lesson => lesson.skills);
  
  // Walk backwards through skill dependencies
  const prereqSkills = new Set<string>();
  currentSkills.forEach(skill => {
    const deps = skills[skill] || [];
    deps.forEach(dep => prereqSkills.add(dep));
  });

  // Find lessons that teach these prerequisite skills
  const subjectData = manifest[subject];
  if (subjectData) {
    for (const grade in subjectData) {
      for (const unit in subjectData[grade]) {
        const unitLessons = subjectData[grade][unit].lessons;
        unitLessons.forEach(lesson => {
          if (lesson.skills.some(skill => prereqSkills.has(skill))) {
            prereqLessons.push(lesson);
          }
        });
      }
    }
  }

  // Return limited count, sorted by difficulty
  return prereqLessons
    .sort((a, b) => a.difficulty - b.difficulty)
    .slice(0, count);
}

/**
 * Find the previous unit in the curriculum sequence
 */
function findPreviousUnit(gradeData: any, currentUnit: string): any | null {
  const units = Object.keys(gradeData);
  const currentIndex = units.indexOf(currentUnit);
  
  if (currentIndex > 0) {
    const prevUnitKey = units[currentIndex - 1];
    return gradeData[prevUnitKey];
  }
  
  return null;
}

/**
 * Find an enrichment lesson with higher difficulty
 */
function findEnrichmentLesson(lessons: any[], ability: number): any | null {
  // Find lesson with difficulty above current ability level
  const enrichmentLessons = lessons.filter(lesson => lesson.difficulty > ability);
  
  if (enrichmentLessons.length > 0) {
    // Return the most challenging lesson
    return enrichmentLessons.sort((a, b) => b.difficulty - a.difficulty)[0];
  }
  
  // Fallback to last lesson in unit
  return lessons[lessons.length - 1] || null;
}
