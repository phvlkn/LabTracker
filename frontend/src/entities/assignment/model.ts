import dayjs from "dayjs";

export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded";

export type AssignmentType = "lab" | "homework" | "other";

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

export type AssignmentInput = Omit<Assignment, "id">;

export const statusInfo: Record<
  AssignmentStatus,
  { label: string; color: string }
> = {
  not_started: { label: "Не начато", color: "default" },
  in_progress: { label: "В работе", color: "processing" },
  submitted: { label: "Сдано", color: "success" },
  graded: { label: "Оценено", color: "purple" },
};

export const typeInfo: Record<AssignmentType, string> = {
  lab: "Лабораторная",
  homework: "Домашнее",
  other: "Прочее",
};

export const formatDate = (date: string | null) =>
  date ? dayjs(date).format("D MMMM, HH:mm") : "Без дедлайна";

export const isOverdue = (item: Assignment) =>
  Boolean(
    item.deadline &&
      dayjs(item.deadline).isBefore(dayjs()) &&
      !["submitted", "graded"].includes(item.status),
  );
