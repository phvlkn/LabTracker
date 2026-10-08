import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useDemoData } from "../app/providers/DemoDataProvider";
import {
  AssignmentFilters,
  type AssignmentFilterValue,
} from "../features/assignment/AssignmentFilters";
import { AssignmentList, Panel } from "../shared/ui/AssignmentList";
import { PageState } from "../shared/ui/PageState";


export function AssignmentsPage() {
  const { courses, assignments, isLoading, error } = useDemoData();
  const [filters, setFilters] = useState<AssignmentFilterValue>({});
  const shown = useMemo(
    () =>
      assignments.filter(
        (item) =>
          (!filters.courseId || item.courseId === filters.courseId) &&
          (!filters.status || item.status === filters.status) &&
          (!filters.type || item.type === filters.type),
      ),
    [assignments, filters],
  );

  return (
    <PageState loading={isLoading} error={error}>
      <div className="page-actions">
        <p>Работы по всем курсам, сроки и текущий прогресс.</p>
        <Link to="/assignments/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Новое задание
          </Button>
        </Link>
      </div>
      <AssignmentFilters
        courses={courses}
        value={filters}
        onChange={setFilters}
      />
      <Panel title={`Найдено: ${shown.length}`}>
        <AssignmentList
          items={shown}
          courses={courses}
          emptyText="По выбранным фильтрам ничего не найдено"
        />
      </Panel>
    </PageState>
  );
}
