/**
 * Standards mapping for human-readable labels
 * Maps curriculum standard codes to friendly display names
 */

interface StandardMapping {
  [code: string]: string;
}

// Common Core Math Standards
const mathStandards: StandardMapping = {
  'K.CC.A.1': 'Count to 100 by ones and tens',
  'K.CC.A.2': 'Count forward from a given number',
  'K.CC.A.3': 'Write numbers 0-20',
  'K.CC.B.4': 'Understand number-quantity relationship',
  'K.CC.B.5': 'Count objects to answer "how many?"',
  'K.CC.C.6': 'Compare numbers',
  'K.CC.C.7': 'Compare two groups of objects',
  '1.OA.A.1': 'Addition and subtraction word problems',
  '1.OA.A.2': 'Word problems with three addends',
  '1.OA.B.3': 'Apply properties of operations',
  '1.OA.B.4': 'Understand subtraction as unknown-addend',
  '1.OA.C.5': 'Relate counting to addition and subtraction',
  '1.OA.C.6': 'Add and subtract within 20',
  '1.OA.D.7': 'Understand meaning of equal sign',
  '1.OA.D.8': 'Determine unknown number in addition/subtraction',
  '1.NBT.A.1': 'Count to 120',
  '1.NBT.B.2': 'Understand place value',
  '1.NBT.B.3': 'Compare two two-digit numbers',
  '1.NBT.C.4': 'Add within 100',
  '1.NBT.C.5': 'Mentally find 10 more or less',
  '1.NBT.C.6': 'Subtract multiples of 10',
  '2.OA.A.1': 'Two-step word problems',
  '2.OA.B.2': 'Fluently add and subtract within 20',
  '2.NBT.A.1': 'Understand place value to 1000',
  '2.NBT.A.2': 'Count within 1000',
  '2.NBT.A.3': 'Read and write numbers to 1000',
  '2.NBT.A.4': 'Compare three-digit numbers',
  '2.NBT.B.5': 'Fluently add and subtract within 100',
  '2.NBT.B.6': 'Add up to four two-digit numbers',
  '2.NBT.B.7': 'Add and subtract within 1000',
  '2.NBT.B.8': 'Mentally add and subtract',
  '2.NBT.B.9': 'Explain addition and subtraction strategies',
  '3.OA.A.1': 'Multiplication and division word problems',
  '3.OA.A.2': 'Division word problems',
  '3.OA.A.3': 'Word problems with four operations',
  '3.OA.A.4': 'Determine unknown number in multiplication/division',
  '3.OA.B.5': 'Apply properties of operations',
  '3.OA.B.6': 'Understand division as unknown-factor',
  '3.OA.C.7': 'Fluently multiply and divide within 100',
  '3.OA.D.8': 'Solve two-step word problems',
  '3.NBT.A.1': 'Use place value understanding',
  '3.NBT.A.2': 'Fluently add and subtract within 1000',
  '3.NBT.A.3': 'Multiply one-digit by multiples of 10',
  
  // Middle School Math Standards
  '6.RP.A.1': 'Understand ratio concepts and use ratio language',
  '7.EE.A.1': 'Apply properties of operations as strategies',
  '8.F.A.1': 'Understand that a function is a rule',
  
  // High School Math Standards
  'HSF-IF.A.1': 'Understand that a function assigns exactly one output to each input',
  'HSF-IF.C.8a': 'Use the process of factoring and completing the square',
  'HSA-REI.B.3': 'Solve linear equations and inequalities in one variable',
  'HSG-CO.A.1': 'Know precise definitions of angle, circle, perpendicular lines',
  'HSF-LE.A.1': 'Distinguish between situations that can be modeled with linear functions'
};

// Common Core ELA Standards
const elaStandards: StandardMapping = {
  'K.RL.1': 'Ask and answer questions about key details',
  'K.RL.2': 'Retell familiar stories',
  'K.RL.3': 'Identify characters, settings, and events',
  'K.RL.4': 'Ask and answer questions about unknown words',
  'K.RL.5': 'Recognize common types of texts',
  'K.RL.6': 'Define role of author and illustrator',
  'K.RL.7': 'Describe relationship between illustrations and text',
  'K.RL.9': 'Compare and contrast adventures of characters',
  'K.RL.10': 'Actively engage in group reading activities',
  'K.RI.1': 'Ask and answer questions about key details in text',
  'K.RI.2': 'Identify main topic and retell key details',
  'K.RI.3': 'Describe connection between individuals/events/ideas',
  'K.RI.4': 'Ask and answer questions about unknown words',
  'K.RI.5': 'Identify front cover, back cover, and title page',
  'K.RI.6': 'Name author and illustrator roles',
  'K.RI.7': 'Describe relationship between illustrations and text',
  'K.RI.8': 'Identify reasons an author gives',
  'K.RI.9': 'Identify similarities between two texts',
  'K.RI.10': 'Actively engage in group reading activities',
  'K.RF.1': 'Demonstrate understanding of print organization',
  'K.RF.2': 'Demonstrate understanding of spoken words',
  'K.RF.3': 'Know and apply grade-level phonics',
  'K.RF.4': 'Read emergent-reader texts',
  '1.RL.1': 'Ask and answer questions about key details',
  '1.RL.2': 'Retell stories and demonstrate understanding',
  '1.RL.3': 'Describe characters, settings, and events',
  '1.RL.4': 'Identify words that suggest feelings',
  '1.RL.5': 'Explain major differences between books',
  '1.RL.6': 'Identify who is telling the story',
  '1.RL.7': 'Use illustrations to describe characters/setting/events',
  '1.RL.9': 'Compare and contrast adventures of characters',
  '1.RL.10': 'Read prose and poetry appropriately complex',
  '1.RI.1': 'Ask and answer questions about key details',
  '1.RI.2': 'Identify main topic and retell key details',
  '1.RI.3': 'Describe connection between individuals/events',
  '1.RI.4': 'Ask and answer questions about unknown words',
  '1.RI.5': 'Know and use text features',
  '1.RI.6': 'Distinguish between information provided by pictures',
  '1.RI.7': 'Use illustrations to describe key ideas',
  '1.RI.8': 'Identify reasons an author gives',
  '1.RI.9': 'Identify similarities between two texts',
  '1.RI.10': 'Read informational texts appropriately complex',
  '1.RF.1': 'Demonstrate understanding of print organization',
  '1.RF.2': 'Demonstrate understanding of spoken words',
  '1.RF.3': 'Know and apply grade-level phonics',
  '1.RF.4': 'Read with sufficient accuracy and fluency',
  
  // Middle School Standards
  'W.6.1': 'Write arguments to support claims with clear reasons and relevant evidence',
  
  // High School ELA Standards
  'RL.9-10.2': 'Determine a theme of a text and analyze its development',
  'RI.11-12.6': 'Determine an author\'s point of view or purpose in a text',
  'W.11-12.1': 'Write arguments to support claims in an analysis of substantive topics'
};

// Next Generation Science Standards
const scienceStandards: StandardMapping = {
  'K-PS2-1': 'Plan and conduct investigation of object motion',
  'K-PS2-2': 'Analyze data from testing objects',
  'K-PS3-1': 'Make observations about energy and motion',
  'K-PS3-2': 'Use tools to observe effects of sunlight',
  'K-LS1-1': 'Use observations to describe living vs non-living',
  'K-ESS2-1': 'Use observations to describe weather patterns',
  'K-ESS2-2': 'Construct argument about weather changes',
  'K-ESS3-1': 'Use model to represent relationship organisms/environment',
  'K-ESS3-3': 'Communicate solutions to reduce human impact',
  'K-ETS1-1': 'Ask questions and make observations',
  'K-ETS1-2': 'Develop simple sketch or drawing',
  'K-ETS1-3': 'Analyze data from tests of objects',
  '1-PS4-1': 'Plan investigations to provide evidence about sound',
  '1-PS4-2': 'Make observations to construct evidence-based account',
  '1-PS4-3': 'Plan and conduct investigations about materials and light',
  '1-PS4-4': 'Use tools to communicate over distance',
  '1-LS1-1': 'Use materials to design mimicking plants/animals',
  '1-LS1-2': 'Read texts and use media about parent/offspring',
  '1-LS3-1': 'Make observations to construct evidence-based account',
  '1-ESS1-1': 'Use observations to describe sun/moon/stars patterns',
  '1-ESS1-2': 'Make observations to determine seasonal changes',
  '1-ETS1-1': 'Ask questions about objects/events in environment',
  '1-ETS1-2': 'Develop simple sketch drawing or model',
  '1-ETS1-3': 'Describe successful solution to design problem',
  
  // Middle School Science Standards
  'MS-ESS2-3': 'Analyze and interpret data on scale properties of objects in solar system',
  
  // High School Science Standards
  'HS-LS1-2': 'Develop and use a model to illustrate hierarchical organization of interacting systems',
  'HS-LS3-3': 'Apply concepts of statistics and probability to explain variation and distribution',
  'HS-PS1-7': 'Use mathematical representations to support the claim that atoms are conserved'
};

// C3 Social Studies Standards
const socialStudiesStandards: StandardMapping = {
  'K.Civ.1': 'Describe roles and responsibilities of people in authority',
  'K.Civ.2': 'Explain how all people can contribute to common good',
  'K.Civ.3': 'Describe benefits of and problems with rules',
  'K.Civ.4': 'Explain need for governments',
  'K.Eco.1': 'Describe economic decisions people make',
  'K.Eco.2': 'Identify examples of goods and services',
  'K.Eco.3': 'Describe role of money in daily life',
  'K.Geo.1': 'Construct maps and models',
  'K.Geo.2': 'Use maps to identify locations',
  'K.Geo.3': 'Identify physical features in local area',
  'K.Geo.4': 'Describe how weather affects activities',
  'K.His.1': 'Create chronological sequence of events',
  'K.His.2': 'Compare life in past to life today',
  'K.His.3': 'Generate questions about individuals and groups',
  '1.Civ.1': 'Explain government role in addressing community problems',
  '1.Civ.2': 'Explain individual roles in civic life',
  '1.Civ.3': 'Describe benefits of diverse backgrounds',
  '1.Civ.4': 'Explain purpose of rules and laws',
  '1.Eco.1': 'Explain choices people make to satisfy wants',
  '1.Eco.2': 'Identify role of money in purchasing goods',
  '1.Eco.3': 'Describe relationship between workers and jobs',
  '1.Geo.1': 'Construct maps of familiar places',
  '1.Geo.2': 'Describe location of places',
  '1.Geo.3': 'Identify cultural and environmental characteristics',
  '1.Geo.4': 'Describe how location affects way people live',
  '1.His.1': 'Demonstrate chronological thinking',
  '1.His.2': 'Identify contributions of historical figures',
  '1.His.3': 'Compare and contrast daily life in different times',
  
  // Middle School Social Studies Standards
  'D2.His.1.6-8': 'Analyze connections among events and developments in broader historical contexts',
  
  // High School Social Studies Standards
  'D2.His.2.9-12': 'Analyze change and continuity in historical eras',
  'D2.Civ.1.9-12': 'Distinguish the powers and responsibilities of citizens, political parties, interest groups'
};

// Combined mapping
const allStandards: StandardMapping = {
  ...mathStandards,
  ...elaStandards,
  ...scienceStandards,
  ...socialStudiesStandards
};

/**
 * Convert standard codes to human-readable labels
 * @param codes Array of standard codes
 * @returns Comma-separated string of human-readable labels
 */
export function renderStandards(codes: string[]): string {
  if (!codes || codes.length === 0) return '';
  
  const labels = codes
    .map(code => allStandards[code] || code)
    .slice(0, 3); // Limit to first 3 to avoid overwhelming UI
  
  const result = labels.join(', ');
  
  // Add "and X more" if there are additional standards
  if (codes.length > 3) {
    const remaining = codes.length - 3;
    return `${result}, and ${remaining} more`;
  }
  
  return result;
}

/**
 * Get standard label for a single code
 * @param code Standard code
 * @returns Human-readable label or the code if not found
 */
export function getStandardLabel(code: string): string {
  return allStandards[code] || code;
}

/**
 * Get all standards for a subject
 * @param subject Subject key
 * @returns Array of standard objects with code and label
 */
export function getSubjectStandards(subject: string): Array<{code: string; label: string}> {
  const prefix = getSubjectPrefix(subject);
  if (!prefix) return [];
  
  return Object.entries(allStandards)
    .filter(([code]) => code.startsWith(prefix))
    .map(([code, label]) => ({ code, label }));
}

/**
 * Get standard code prefix for subject
 */
function getSubjectPrefix(subject: string): string | null {
  switch (subject) {
    case 'math': return 'K.CC'; // Math starts with counting/cardinality
    case 'reading': return 'K.RL'; // Reading starts with literature
    case 'science': return 'K-PS'; // Science starts with physical science
    case 'social-studies': return 'K.Civ'; // Social studies starts with civics
    default: return null;
  }
}
