export interface Course {
  id: number;
  title: string;
  description: string;
  accent: string;
}

export type CourseInput = Pick<Course, "title" | "description">;
