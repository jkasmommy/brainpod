export type Subject = "math" | "reading" | "science" | "social-studies";

export function abilityToLabelAndStart(subject: Subject, ability: number): {
  label: string; grade: string; unit: string;
} {
  // Simple mapping you can refine later per subject
  if (subject === "math") {
    if (ability <= -0.6) return { label: "Remediate", grade: "K", unit: "counting" };
    if (ability <= 0.3)  return { label: "On Grade", grade: "1", unit: "place-value" };
    return { label: "On Grade + enrichment", grade: "1", unit: "add-sub" };
  }
  if (subject === "reading") {
    if (ability <= -0.6) return { label: "Remediate", grade: "K", unit: "phonics" };
    if (ability <= 0.3)  return { label: "On Grade", grade: "K", unit: "phonics" };
    return { label: "On Grade + enrichment", grade: "K", unit: "phonics" };
  }
  if (subject === "science") {
    if (ability <= -0.3) return { label: "On Grade - review", grade: "3", unit: "life-cycles" };
    if (ability <= 0.5)  return { label: "On Grade", grade: "3", unit: "matter" };
    return { label: "Accelerate +1", grade: "3", unit: "matter" };
  }
  // social-studies
  if (ability <= -0.3) return { label: "On Grade - review", grade: "5", unit: "us-regions" };
  if (ability <= 0.5)  return { label: "On Grade", grade: "5", unit: "us-regions" };
  return { label: "On Grade + enrichment", grade: "5", unit: "civics" };
}
