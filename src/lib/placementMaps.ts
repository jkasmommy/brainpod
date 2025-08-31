export type Subject = "math" | "reading" | "science" | "social-studies";

export function abilityToLabelAndStart(subject: Subject, ability: number): {
  label: string; grade: string; unit: string;
} {
  // Enhanced mapping with high school course placement
  if (subject === "math") {
    if (ability <= -0.6) return { label: "Remediate", grade: "K", unit: "counting" };
    if (ability <= 0.0)  return { label: "On Grade", grade: "1", unit: "place-value" };
    if (ability <= 0.3)  return { label: "On Grade", grade: "6", unit: "ratios" };
    if (ability <= 0.6)  return { label: "Recommended Course", grade: "HS", unit: "algebra-1" };
    if (ability <= 1.0)  return { label: "Recommended Course", grade: "HS", unit: "geometry" };
    return { label: "Advanced Course", grade: "HS", unit: "algebra-2" };
  }
  
  if (subject === "reading") {
    if (ability <= -0.6) return { label: "Remediate", grade: "K", unit: "phonics" };
    if (ability <= 0.0)  return { label: "On Grade", grade: "K", unit: "phonics" };
    if (ability <= 0.3)  return { label: "On Grade", grade: "6", unit: "argument" };
    if (ability <= 0.6)  return { label: "Recommended Course", grade: "HS", unit: "ela-9-10" };
    return { label: "Advanced Course", grade: "HS", unit: "ela-11-12" };
  }
  
  if (subject === "science") {
    if (ability <= -0.3) return { label: "On Grade - review", grade: "3", unit: "life-cycles" };
    if (ability <= 0.0)  return { label: "On Grade", grade: "3", unit: "matter" };
    if (ability <= 0.3)  return { label: "On Grade", grade: "6", unit: "earth" };
    if (ability <= 0.6)  return { label: "Recommended Course", grade: "HS", unit: "biology" };
    return { label: "Advanced Course", grade: "HS", unit: "chemistry" };
  }
  
  // social-studies
  if (ability <= -0.3) return { label: "On Grade - review", grade: "5", unit: "us-regions" };
  if (ability <= 0.0)  return { label: "On Grade", grade: "5", unit: "us-regions" };
  if (ability <= 0.3)  return { label: "On Grade", grade: "6", unit: "ancient" };
  if (ability <= 0.6)  return { label: "Recommended Course", grade: "HS", unit: "us-history" };
  return { label: "Advanced Course", grade: "HS", unit: "govt-civics" };
}
