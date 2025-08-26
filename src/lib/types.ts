export type Manifest = {
  [subject: string]: {
    [grade: string]: {
      [unit: string]: {
        title: string;
        lessons: {
          id: string;
          title: string;
          skills: string[];
          minutes: number;
          difficulty: number;
          standards?: string[];
        }[];
      };
    };
  };
};

export type SkillGraph = { [skillId: string]: string[] };

export type Placement = {
  subject: "math" | "reading" | "science" | "social-studies";
  ability: number;
  label: string;
  recommendedGrade: string;
  recommendedUnit?: string;
};

export type PlanItem = {
  lessonId: string;
  skills: string[];
  scheduled_for: string;   // YYYY-MM-DD
  status: "todo" | "inprogress" | "done" | "locked";
  priority: number;
};

export type Subject = "math" | "reading" | "science" | "social-studies";
