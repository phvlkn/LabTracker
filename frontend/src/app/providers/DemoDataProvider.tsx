import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  Assignment,
  AssignmentInput,
} from "../../entities/assignment/model";
import type { Course, CourseInput } from "../../entities/course/model";
import {
  initialAssignments,
  initialCourses,
} from "../../shared/lib/demoData";

interface StoredData {
  courses: Course[];
  assignments: Assignment[];
}

interface DemoDataContextValue extends StoredData {
  isLoading: boolean;
  error: string | null;
  addCourse: (data: CourseInput) => number;
  updateCourse: (id: number, data: CourseInput) => void;
  deleteCourse: (id: number) => void;
  addAssignment: (data: AssignmentInput) => number;
  updateAssignment: (id: number, data: Partial<AssignmentInput>) => void;
  deleteAssignment: (id: number) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = "labtracker-demo-data-v3";
const accents = ["#51657e", "#7a6861", "#647465", "#76647a"];

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

function loadStoredData(): StoredData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { courses: initialCourses, assignments: initialAssignments };
  }
  return JSON.parse(stored) as StoredData;
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoredData>(() => {
    try {
      return loadStoredData();
    } catch {
      return { courses: initialCourses, assignments: initialAssignments };
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoading]);

  const value = useMemo<DemoDataContextValue>(
    () => ({
      ...data,
      isLoading,
      error,
      addCourse: (input) => {
        const id = Math.max(0, ...data.courses.map((course) => course.id)) + 1;
        setData((current) => ({
          ...current,
          courses: [
            ...current.courses,
            { ...input, id, accent: accents[id % accents.length] },
          ],
        }));
        return id;
      },
      updateCourse: (id, input) => {
        setData((current) => ({
          ...current,
          courses: current.courses.map((course) =>
            course.id === id ? { ...course, ...input } : course,
          ),
        }));
      },
      deleteCourse: (id) => {
        setData((current) => ({
          courses: current.courses.filter((course) => course.id !== id),
          assignments: current.assignments.filter(
            (assignment) => assignment.courseId !== id,
          ),
        }));
      },
      addAssignment: (input) => {
        const id =
          Math.max(0, ...data.assignments.map((assignment) => assignment.id)) + 1;
        setData((current) => ({
          ...current,
          assignments: [...current.assignments, { ...input, id }],
        }));
        return id;
      },
      updateAssignment: (id, input) => {
        setData((current) => ({
          ...current,
          assignments: current.assignments.map((assignment) =>
            assignment.id === id ? { ...assignment, ...input } : assignment,
          ),
        }));
      },
      deleteAssignment: (id) => {
        setData((current) => ({
          ...current,
          assignments: current.assignments.filter(
            (assignment) => assignment.id !== id,
          ),
        }));
      },
      resetDemoData: () => {
        setData({ courses: initialCourses, assignments: initialAssignments });
      },
    }),
    [data, error, isLoading],
  );

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error("useDemoData должен использоваться внутри DemoDataProvider");
  }
  return context;
}
