import type { Assignment } from "../../entities/assignment/model";
import type { Course } from "../../entities/course/model";

export const initialCourses: Course[] = [
  {
    id: 1,
    title: "Fullstack-разработка",
    description: "Практика React, FastAPI и проектирование веб-приложений.",
    accent: "#51657e",
  },
  {
    id: 2,
    title: "Базы данных",
    description: "Реляционная модель, SQL и проектирование схем данных.",
    accent: "#7a6861",
  },
  {
    id: 3,
    title: "Компьютерные сети",
    description: "Сетевые протоколы и архитектура распределённых систем.",
    accent: "#647465",
  },
];

export const initialAssignments: Assignment[] = [
  {
    id: 1,
    courseId: 1,
    title: "Лабораторная работа №3",
    description: "Архитектура frontend и динамический интерфейс.",
    type: "lab",
    status: "in_progress",
    deadline: "2026-10-12T18:00:00+03:00",
    maxGrade: 10,
    grade: null,
  },
  {
    id: 2,
    courseId: 1,
    title: "Лабораторная работа №4",
    description: "Аутентификация, JWT и защищённые маршруты.",
    type: "lab",
    status: "not_started",
    deadline: "2026-10-17T18:00:00+03:00",
    maxGrade: 10,
    grade: null,
  },
  {
    id: 3,
    courseId: 2,
    title: "Нормализация схемы",
    description: "Привести учебную схему к третьей нормальной форме.",
    type: "homework",
    status: "submitted",
    deadline: "2026-10-07T18:00:00+03:00",
    maxGrade: 10,
    grade: null,
  },
  {
    id: 4,
    courseId: 2,
    title: "Контрольная работа",
    description: "Ключи, индексы и транзакции.",
    type: "other",
    status: "graded",
    deadline: "2026-10-05T10:00:00+03:00",
    maxGrade: 20,
    grade: 18.5,
  },
  {
    id: 5,
    courseId: 3,
    title: "Домашнее задание: TCP/IP",
    description: "Краткий разбор модели TCP/IP.",
    type: "homework",
    status: "in_progress",
    deadline: "2026-10-08T23:59:00+03:00",
    maxGrade: 10,
    grade: null,
  },
];
