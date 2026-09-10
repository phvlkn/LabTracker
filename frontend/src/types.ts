export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded";
export type AssignmentType = "lab" | "homework" | "other";

export interface Course {
  id: number;
  title: string;
  description: string;
  accent: string;
}

export interface Assignment {
  id: number;
  courseId: number;
  title: string;
  description: string;
  type: AssignmentType;
  status: AssignmentStatus;
  deadline: string | null;
  maxGrade: number;
  grade: number | null;
}
