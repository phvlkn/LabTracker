import { Select } from "antd";

import {
  statusInfo,
  typeInfo,
  type AssignmentStatus,
  type AssignmentType,
} from "../../entities/assignment/model";
import type { Course } from "../../entities/course/model";


export interface AssignmentFilterValue {
  courseId?: number;
  status?: AssignmentStatus;
  type?: AssignmentType;
}

export function AssignmentFilters({
  courses,
  value,
  onChange,
}: {
  courses: Course[];
  value: AssignmentFilterValue;
  onChange: (value: AssignmentFilterValue) => void;
}) {
  return (
    <div className="filters">
      <Select
        allowClear
        placeholder="Все курсы"
        value={value.courseId}
        onChange={(courseId) => onChange({ ...value, courseId })}
        options={courses.map((course) => ({
          value: course.id,
          label: course.title,
        }))}
      />
      <Select
        allowClear
        placeholder="Все статусы"
        value={value.status}
        onChange={(status) => onChange({ ...value, status })}
        options={Object.entries(statusInfo).map(([itemValue, info]) => ({
          value: itemValue,
          label: info.label,
        }))}
      />
      <Select
        allowClear
        placeholder="Все типы"
        value={value.type}
        onChange={(type) => onChange({ ...value, type })}
        options={Object.entries(typeInfo).map(([itemValue, label]) => ({
          value: itemValue,
          label,
        }))}
      />
    </div>
  );
}
