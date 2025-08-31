/**
 * Comprehensive K-12 Curriculum System
 * Aligned with national standards and adaptive learning principles
 */

export interface Standard {
  id: string;
  code: string; // e.g., "CCSS.MATH.K.CC.A.1"
  title: string;
  description: string;
  grade: string;
  subject: string;
  domain: string;
  cluster?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  standards: string[]; // Standard IDs
  prerequisites: string[]; // Other skill IDs that must be mastered first
  difficulty: number; // -2 to 2 scale
  estimatedMinutes: number;
  type: 'concept' | 'skill' | 'application' | 'analysis' | 'synthesis';
}

export interface LessonPlan {
  id: string;
  title: string;
  description: string;
  skills: string[]; // SkillNode IDs
  standards: string[]; // Standard IDs
  grade: string;
  subject: string;
  unit: string;
  sequence: number; // Order within unit
  difficulty: number;
  estimatedMinutes: number;
  objectives: string[];
  materials: string[];
  activities: Activity[];
  assessment: Assessment;
}

export interface Activity {
  id: string;
  type: 'introduction' | 'guided_practice' | 'independent_practice' | 'assessment' | 'review';
  title: string;
  description: string;
  duration: number;
  instructions: string[];
  interactionType: 'multiple_choice' | 'drag_drop' | 'text_input' | 'drawing' | 'game';
  content: any; // Flexible content structure
}

export interface Assessment {
  questions: AssessmentQuestion[];
  passingScore: number; // 0-1 scale
  adaptiveScoring: boolean;
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'performance';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: number;
  skills: string[];
  standards: string[];
}

export interface GradeLevel {
  grade: string;
  displayName: string;
  ageRange: [number, number];
  subjects: SubjectCurriculum[];
}

export interface SubjectCurriculum {
  subject: string;
  displayName: string;
  description: string;
  units: CurriculumUnit[];
  yearEndGoals: string[];
  prerequisites: string[];
}

export interface CurriculumUnit {
  id: string;
  name: string;
  description: string;
  sequence: number;
  estimatedWeeks: number;
  skills: string[]; // SkillNode IDs
  standards: string[]; // Standard IDs
  lessons: string[]; // LessonPlan IDs
  assessments: string[]; // Assessment IDs
  prerequisites: string[]; // Other unit IDs
}

export interface StudentProgress {
  studentId: string;
  subject: string;
  currentGrade: string;
  currentUnit: string;
  currentLesson: string;
  masteredSkills: string[]; // SkillNode IDs
  skillLevels: Record<string, number>; // skill ID -> mastery level (0-1)
  adaptiveLevel: number; // Overall ability level for subject
  lastAssessment: Date;
  recommendedPath: string[]; // Ordered list of lesson IDs
  strugglingAreas: string[]; // Skill IDs where student needs extra support
  acceleratedAreas: string[]; // Skill IDs where student is ready for advanced work
}

// Common Core Mathematics Standards K-12
export const MATH_STANDARDS: Record<string, Standard> = {
  // Kindergarten - Counting & Cardinality
  'CCSS.MATH.K.CC.A.1': {
    id: 'CCSS.MATH.K.CC.A.1',
    code: 'CCSS.MATH.K.CC.A.1',
    title: 'Count to 100',
    description: 'Count to 100 by ones and by tens',
    grade: 'K',
    subject: 'math',
    domain: 'Counting & Cardinality',
    cluster: 'Know number names and the count sequence'
  },
  'CCSS.MATH.K.CC.A.2': {
    id: 'CCSS.MATH.K.CC.A.2',
    code: 'CCSS.MATH.K.CC.A.2',
    title: 'Count Forward',
    description: 'Count forward beginning from a given number within the known sequence',
    grade: 'K',
    subject: 'math',
    domain: 'Counting & Cardinality',
    cluster: 'Know number names and the count sequence'
  },
  'CCSS.MATH.K.CC.B.4': {
    id: 'CCSS.MATH.K.CC.B.4',
    code: 'CCSS.MATH.K.CC.B.4',
    title: 'Number-Object Correspondence',
    description: 'Understand the relationship between numbers and quantities; connect counting to cardinality',
    grade: 'K',
    subject: 'math',
    domain: 'Counting & Cardinality',
    cluster: 'Count to tell the number of objects'
  },

  // Grade 1 - Operations & Algebraic Thinking
  'CCSS.MATH.1.OA.A.1': {
    id: 'CCSS.MATH.1.OA.A.1',
    code: 'CCSS.MATH.1.OA.A.1',
    title: 'Addition and Subtraction Word Problems',
    description: 'Use addition and subtraction within 20 to solve word problems',
    grade: '1',
    subject: 'math',
    domain: 'Operations & Algebraic Thinking',
    cluster: 'Represent and solve problems involving addition and subtraction'
  },

  // Grade 2 - Number & Operations in Base Ten
  'CCSS.MATH.2.NBT.A.1': {
    id: 'CCSS.MATH.2.NBT.A.1',
    code: 'CCSS.MATH.2.NBT.A.1',
    title: 'Place Value to 1000',
    description: 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones',
    grade: '2',
    subject: 'math',
    domain: 'Number & Operations in Base Ten',
    cluster: 'Understand place value'
  },

  // Grade 3 - Operations & Algebraic Thinking
  'CCSS.MATH.3.OA.A.3': {
    id: 'CCSS.MATH.3.OA.A.3',
    code: 'CCSS.MATH.3.OA.A.3',
    title: 'Multiplication and Division',
    description: 'Use multiplication and division within 100 to solve word problems',
    grade: '3',
    subject: 'math',
    domain: 'Operations & Algebraic Thinking',
    cluster: 'Represent and solve problems involving multiplication and division'
  }
};

// English Language Arts Standards K-12
export const ELA_STANDARDS: Record<string, Standard> = {
  // Kindergarten - Reading Foundation Skills
  'CCSS.ELA-LITERACY.RF.K.1.A': {
    id: 'CCSS.ELA-LITERACY.RF.K.1.A',
    code: 'CCSS.ELA-LITERACY.RF.K.1.A',
    title: 'Follow Words Left to Right',
    description: 'Follow words from left to right, top to bottom, and page by page',
    grade: 'K',
    subject: 'reading',
    domain: 'Reading Foundation Skills',
    cluster: 'Print Concepts'
  },
  'CCSS.ELA-LITERACY.RF.K.2.A': {
    id: 'CCSS.ELA-LITERACY.RF.K.2.A',
    code: 'CCSS.ELA-LITERACY.RF.K.2.A',
    title: 'Rhyming Words',
    description: 'Recognize and produce rhyming words',
    grade: 'K',
    subject: 'reading',
    domain: 'Reading Foundation Skills',
    cluster: 'Phonological Awareness'
  },
  'CCSS.ELA-LITERACY.RF.K.3.A': {
    id: 'CCSS.ELA-LITERACY.RF.K.3.A',
    code: 'CCSS.ELA-LITERACY.RF.K.3.A',
    title: 'Letter-Sound Correspondence',
    description: 'Demonstrate basic knowledge of one-to-one letter-sound correspondences',
    grade: 'K',
    subject: 'reading',
    domain: 'Reading Foundation Skills',
    cluster: 'Phonics and Word Recognition'
  },

  // Grade 1 - Reading Foundation Skills
  'CCSS.ELA-LITERACY.RF.1.1.A': {
    id: 'CCSS.ELA-LITERACY.RF.1.1.A',
    code: 'CCSS.ELA-LITERACY.RF.1.1.A',
    title: 'Capitalization and Punctuation',
    description: 'Recognize the distinguishing features of a sentence',
    grade: '1',
    subject: 'reading',
    domain: 'Reading Foundation Skills',
    cluster: 'Print Concepts'
  }
};

// Science Standards (Next Generation Science Standards)
export const SCIENCE_STANDARDS: Record<string, Standard> = {
  // Kindergarten - Living Things
  'K-LS1-1': {
    id: 'K-LS1-1',
    code: 'K-LS1-1',
    title: 'Living Things Have Needs',
    description: 'Use observations to describe patterns of what plants and animals need to survive',
    grade: 'K',
    subject: 'science',
    domain: 'Life Science',
    cluster: 'From Molecules to Organisms: Structures and Processes'
  },

  // Grade 1 - Waves
  '1-PS4-1': {
    id: '1-PS4-1',
    code: '1-PS4-1',
    title: 'Sound and Light',
    description: 'Plan and conduct investigations to provide evidence that vibrating materials can make sound',
    grade: '1',
    subject: 'science',
    domain: 'Physical Science',
    cluster: 'Waves and their Applications in Technologies for Information Transfer'
  }
};

// Social Studies Standards (C3 Framework)
export const SOCIAL_STUDIES_STANDARDS: Record<string, Standard> = {
  // Kindergarten - Civics
  'K.Civ.1': {
    id: 'K.Civ.1',
    code: 'K.Civ.1',
    title: 'Rules and Laws',
    description: 'Describe roles and responsibilities of people in authority',
    grade: 'K',
    subject: 'social-studies',
    domain: 'Civics',
    cluster: 'Civic Ideas and Practices'
  },

  // Grade 1 - Geography
  '1.Geo.1': {
    id: '1.Geo.1',
    code: '1.Geo.1',
    title: 'Geographic Representations',
    description: 'Use maps, globes, and other simple geographic models to identify cultural and environmental characteristics',
    grade: '1',
    subject: 'social-studies',
    domain: 'Geography',
    cluster: 'Geographic Reasoning'
  }
};

// Skill Nodes for Mathematics
export const MATH_SKILLS: Record<string, SkillNode> = {
  'count_1_10': {
    id: 'count_1_10',
    name: 'Count 1-10',
    description: 'Count objects from 1 to 10 with one-to-one correspondence',
    standards: ['CCSS.MATH.K.CC.A.1', 'CCSS.MATH.K.CC.B.4'],
    prerequisites: [],
    difficulty: -1.5,
    estimatedMinutes: 15,
    type: 'skill'
  },
  'count_11_20': {
    id: 'count_11_20',
    name: 'Count 11-20',
    description: 'Count objects from 11 to 20 with understanding of teen numbers',
    standards: ['CCSS.MATH.K.CC.A.1', 'CCSS.MATH.K.CC.B.4'],
    prerequisites: ['count_1_10'],
    difficulty: -1.0,
    estimatedMinutes: 20,
    type: 'skill'
  },
  'number_recognition_1_10': {
    id: 'number_recognition_1_10',
    name: 'Number Recognition 1-10',
    description: 'Recognize and identify written numerals 1-10',
    standards: ['CCSS.MATH.K.CC.A.1'],
    prerequisites: ['count_1_10'],
    difficulty: -1.2,
    estimatedMinutes: 18,
    type: 'concept'
  },
  'addition_within_5': {
    id: 'addition_within_5',
    name: 'Addition Within 5',
    description: 'Add numbers with sums up to 5 using objects and pictures',
    standards: ['CCSS.MATH.1.OA.A.1'],
    prerequisites: ['count_1_10', 'number_recognition_1_10'],
    difficulty: -0.8,
    estimatedMinutes: 25,
    type: 'skill'
  },
  'addition_within_10': {
    id: 'addition_within_10',
    name: 'Addition Within 10',
    description: 'Add numbers with sums up to 10 fluently',
    standards: ['CCSS.MATH.1.OA.A.1'],
    prerequisites: ['addition_within_5'],
    difficulty: -0.5,
    estimatedMinutes: 30,
    type: 'skill'
  }
};

// Skill Nodes for Reading
export const READING_SKILLS: Record<string, SkillNode> = {
  'letter_recognition_uppercase': {
    id: 'letter_recognition_uppercase',
    name: 'Uppercase Letter Recognition',
    description: 'Recognize and name all uppercase letters of the alphabet',
    standards: ['CCSS.ELA-LITERACY.RF.K.1.A'],
    prerequisites: [],
    difficulty: -1.5,
    estimatedMinutes: 20,
    type: 'concept'
  },
  'letter_recognition_lowercase': {
    id: 'letter_recognition_lowercase',
    name: 'Lowercase Letter Recognition',
    description: 'Recognize and name all lowercase letters of the alphabet',
    standards: ['CCSS.ELA-LITERACY.RF.K.1.A'],
    prerequisites: ['letter_recognition_uppercase'],
    difficulty: -1.2,
    estimatedMinutes: 25,
    type: 'concept'
  },
  'letter_sounds_basic': {
    id: 'letter_sounds_basic',
    name: 'Basic Letter Sounds',
    description: 'Produce the primary sound for each consonant and vowel',
    standards: ['CCSS.ELA-LITERACY.RF.K.3.A'],
    prerequisites: ['letter_recognition_lowercase'],
    difficulty: -1.0,
    estimatedMinutes: 30,
    type: 'skill'
  },
  'rhyming_words': {
    id: 'rhyming_words',
    name: 'Rhyming Words',
    description: 'Recognize and produce rhyming words',
    standards: ['CCSS.ELA-LITERACY.RF.K.2.A'],
    prerequisites: [],
    difficulty: -1.3,
    estimatedMinutes: 15,
    type: 'skill'
  }
};

// Grade Level Curriculum Structure
export const GRADE_LEVELS: Record<string, GradeLevel> = {
  'K': {
    grade: 'K',
    displayName: 'Kindergarten',
    ageRange: [5, 6],
    subjects: [
      {
        subject: 'math',
        displayName: 'Mathematics',
        description: 'Number sense, counting, and basic operations',
        units: [
          {
            id: 'k_math_counting',
            name: 'Counting and Cardinality',
            description: 'Learn to count objects and understand number relationships',
            sequence: 1,
            estimatedWeeks: 8,
            skills: ['count_1_10', 'count_11_20', 'number_recognition_1_10'],
            standards: ['CCSS.MATH.K.CC.A.1', 'CCSS.MATH.K.CC.A.2', 'CCSS.MATH.K.CC.B.4'],
            lessons: ['k_math_counting_lesson_1', 'k_math_counting_lesson_2'],
            assessments: ['k_math_counting_assessment'],
            prerequisites: []
          },
          {
            id: 'k_math_addition_subtraction',
            name: 'Addition and Subtraction',
            description: 'Introduction to addition and subtraction concepts',
            sequence: 2,
            estimatedWeeks: 6,
            skills: ['addition_within_5'],
            standards: ['CCSS.MATH.1.OA.A.1'],
            lessons: ['k_math_addition_lesson_1'],
            assessments: ['k_math_addition_assessment'],
            prerequisites: ['k_math_counting']
          }
        ],
        yearEndGoals: [
          'Count to 100 by ones and tens',
          'Understand number relationships within 20',
          'Add and subtract within 10'
        ],
        prerequisites: []
      },
      {
        subject: 'reading',
        displayName: 'Reading & Language Arts',
        description: 'Phonics, letter recognition, and early reading skills',
        units: [
          {
            id: 'k_reading_letters',
            name: 'Letter Recognition and Sounds',
            description: 'Learn letter names and sounds',
            sequence: 1,
            estimatedWeeks: 10,
            skills: ['letter_recognition_uppercase', 'letter_recognition_lowercase', 'letter_sounds_basic'],
            standards: ['CCSS.ELA-LITERACY.RF.K.1.A', 'CCSS.ELA-LITERACY.RF.K.3.A'],
            lessons: ['k_reading_letters_lesson_1'],
            assessments: ['k_reading_letters_assessment'],
            prerequisites: []
          },
          {
            id: 'k_reading_phonics',
            name: 'Phonological Awareness',
            description: 'Develop awareness of sounds in words',
            sequence: 2,
            estimatedWeeks: 8,
            skills: ['rhyming_words'],
            standards: ['CCSS.ELA-LITERACY.RF.K.2.A'],
            lessons: ['k_reading_phonics_lesson_1'],
            assessments: ['k_reading_phonics_assessment'],
            prerequisites: ['k_reading_letters']
          }
        ],
        yearEndGoals: [
          'Recognize all letters and their sounds',
          'Read simple CVC words',
          'Demonstrate phonological awareness'
        ],
        prerequisites: []
      }
    ]
  },
  '1': {
    grade: '1',
    displayName: 'First Grade',
    ageRange: [6, 7],
    subjects: [
      {
        subject: 'math',
        displayName: 'Mathematics',
        description: 'Addition, subtraction, and place value concepts',
        units: [
          {
            id: '1_math_addition_subtraction',
            name: 'Addition and Subtraction within 20',
            description: 'Master addition and subtraction facts within 20',
            sequence: 1,
            estimatedWeeks: 12,
            skills: ['addition_within_10'],
            standards: ['CCSS.MATH.1.OA.A.1'],
            lessons: ['1_math_addition_lesson_1'],
            assessments: ['1_math_addition_assessment'],
            prerequisites: ['k_math_addition_subtraction']
          }
        ],
        yearEndGoals: [
          'Add and subtract within 20 fluently',
          'Understand place value to 120',
          'Solve word problems'
        ],
        prerequisites: ['K_math']
      }
    ]
  }
};

/**
 * Load curriculum manifest from JSON file
 */
export async function getManifest(): Promise<any> {
  try {
    const response = await fetch('/content/manifest.json');
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading manifest:', error);
    throw error;
  }
}

/**
 * Get unit data for a specific subject, grade, and unit
 * Handles both regular grades (K, 1, 2, etc.) and high school courses (HS)
 */
export async function getUnit(subject: string, grade: string, unitId: string): Promise<any> {
  try {
    const manifest = await getManifest();
    
    if (!manifest[subject] || !manifest[subject][grade]) {
      return null;
    }
    
    const gradeData = manifest[subject][grade];
    
    // For high school (HS), the unitId is actually a course
    if (grade === 'HS') {
      return gradeData[unitId] || null;
    }
    
    // For regular grades, unitId is a unit within the grade
    return gradeData[unitId] || null;
  } catch (error) {
    console.error('Error loading unit:', error);
    return null;
  }
}

/**
 * Get lesson data for a specific lesson
 */
export async function getLesson(subject: string, grade: string, unitId: string, lessonId: string): Promise<any> {
  try {
    const unit = await getUnit(subject, grade, unitId);
    if (!unit || !unit.lessons) {
      return null;
    }
    
    return unit.lessons.find((lesson: any) => lesson.id === lessonId) || null;
  } catch (error) {
    console.error('Error loading lesson:', error);
    return null;
  }
}

/**
 * Get all available subjects from manifest
 */
export async function getSubjects(): Promise<string[]> {
  try {
    const manifest = await getManifest();
    return Object.keys(manifest);
  } catch (error) {
    console.error('Error loading subjects:', error);
    return [];
  }
}

/**
 * Get all available grades for a subject
 */
export async function getGrades(subject: string): Promise<string[]> {
  try {
    const manifest = await getManifest();
    if (!manifest[subject]) {
      return [];
    }
    
    return Object.keys(manifest[subject]);
  } catch (error) {
    console.error('Error loading grades:', error);
    return [];
  }
}

/**
 * Get all units/courses for a subject and grade
 */
export async function getUnits(subject: string, grade: string): Promise<Array<{id: string; title: string; description?: string}>> {
  try {
    const manifest = await getManifest();
    if (!manifest[subject] || !manifest[subject][grade]) {
      return [];
    }
    
    const gradeData = manifest[subject][grade];
    return Object.entries(gradeData).map(([id, data]: [string, any]) => ({
      id,
      title: data.title,
      description: data.description
    }));
  } catch (error) {
    console.error('Error loading units:', error);
    return [];
  }
}

/**
 * Get appropriate curriculum based on diagnostic results
 */
export function getPersonalizedCurriculum(
  subject: string,
  diagnosticResults: any,
  currentProgress: StudentProgress
): {
  recommendedGrade: string;
  recommendedUnit: string;
  skillGaps: string[];
  accelerationOpportunities: string[];
  adaptiveModifications: any;
} {
  const ability = diagnosticResults.ability || 0;
  const grade = diagnosticResults.recommendedGrade || 'K';
  
  // Determine appropriate starting point based on ability
  let recommendedGrade = grade;
  let recommendedUnit = '';
  
  // Find skill gaps and strengths
  const skillGaps: string[] = [];
  const accelerationOpportunities: string[] = [];
  
  // Get grade level curriculum
  const gradeLevel = GRADE_LEVELS[recommendedGrade];
  if (gradeLevel) {
    const subjectCurriculum = gradeLevel.subjects.find(s => s.subject === subject);
    if (subjectCurriculum && subjectCurriculum.units.length > 0) {
      recommendedUnit = subjectCurriculum.units[0].id;
      
      // Analyze skill mastery vs requirements
      const allSkills = subject === 'math' ? MATH_SKILLS : READING_SKILLS;
      
      for (const unit of subjectCurriculum.units) {
        for (const skillId of unit.skills) {
          const skill = allSkills[skillId];
          if (skill) {
            const masteryLevel = currentProgress.skillLevels[skillId] || 0;
            
            if (masteryLevel < 0.7 && skill.difficulty <= ability + 0.5) {
              skillGaps.push(skillId);
            } else if (masteryLevel > 0.8 && skill.difficulty < ability - 0.5) {
              accelerationOpportunities.push(skillId);
            }
          }
        }
      }
    }
  }
  
  return {
    recommendedGrade,
    recommendedUnit,
    skillGaps,
    accelerationOpportunities,
    adaptiveModifications: {
      difficultyAdjustment: ability,
      pacingModification: accelerationOpportunities.length > skillGaps.length ? 'accelerated' : 'standard',
      supportLevel: skillGaps.length > 3 ? 'high' : skillGaps.length > 1 ? 'medium' : 'low'
    }
  };
}

/**
 * Generate adaptive lesson sequence based on student needs
 */
export function generateAdaptiveLessonSequence(
  subject: string,
  startingUnit: string,
  studentProgress: StudentProgress,
  targetLessons: number = 10
): string[] {
  const lessonSequence: string[] = [];
  
  // This would be expanded to create a sophisticated adaptive sequence
  // For now, return a basic sequence
  const baseSequence = [`${subject}_${startingUnit}_lesson_1`];
  
  return baseSequence.slice(0, targetLessons);
}

/**
 * Get next recommended skill based on prerequisites and mastery
 */
export function getNextRecommendedSkill(
  subject: string,
  studentProgress: StudentProgress
): string | null {
  const allSkills = subject === 'math' ? MATH_SKILLS : READING_SKILLS;
  const masteredSkills = new Set(studentProgress.masteredSkills);
  
  // Find skills where all prerequisites are met but skill isn't mastered
  for (const [skillId, skill] of Object.entries(allSkills)) {
    if (masteredSkills.has(skillId)) continue;
    
    const prerequisitesMet = skill.prerequisites.every(prereq => masteredSkills.has(prereq));
    if (prerequisitesMet) {
      return skillId;
    }
  }
  
  return null;
}
