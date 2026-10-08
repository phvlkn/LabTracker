import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { isOverdue } from "../entities/assignment/model";
import { useDemoData } from "../app/providers/DemoDataProvider";
import { AssignmentList, Panel } from "../shared/ui/AssignmentList";
import { PageState } from "../shared/ui/PageState";


function Metric({
  value,
  label,
  danger,
}: {
  value: number;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className={`metric ${danger ? "metric-danger" : ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function DashboardPage() {
  const { courses, assignments, isLoading, error } = useDemoData();
  const upcoming = assignments
    .filter((item) => item.deadline && dayjs(item.deadline).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf())
    .slice(0, 4);
  const overdue = assignments.filter(isOverdue);

  return (
    <PageState loading={isLoading} error={error}>
      <div className="dashboard">
        <section className="welcome">
          <div>
            <p className="eyebrow">План на неделю</p>
            <h2>Спокойно, всё под контролем.</h2>
            <p>Следите за сроками, работами и результатами в одном месте.</p>
          </div>
          <Link to="/assignments/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Добавить задание
            </Button>
          </Link>
        </section>
        <section className="metrics">
          <Metric
            value={assignments.filter((item) => item.status === "in_progress").length}
            label="в работе"
          />
          <Metric value={overdue.length} label="просрочено" danger />
          <Metric
            value={
              assignments.filter((item) =>
                ["submitted", "graded"].includes(item.status),
              ).length
            }
            label="сдано и оценено"
          />
        </section>
        <section className="content-grid">
          <Panel
            title="Ближайшие дедлайны"
            action={<Link to="/assignments">Все задания</Link>}
          >
            <AssignmentList items={upcoming} courses={courses} />
          </Panel>
          <Panel
            title="Просроченные"
            action={<span className="danger-text">Требуют внимания</span>}
          >
            <AssignmentList
              items={overdue}
              courses={courses}
              emptyText="Нет просроченных работ"
            />
          </Panel>
        </section>
        <Panel title="Курсы" action={<Link to="/courses">Открыть курсы</Link>}>
          <div className="course-row">
            {courses.map((course) => (
              <Link
                to={`/courses/${course.id}`}
                className="mini-course"
                key={course.id}
              >
                <span style={{ background: course.accent }} />
                <div>
                  <b>{course.title}</b>
                  <small>
                    {
                      assignments.filter((item) => item.courseId === course.id)
                        .length
                    }{" "}
                    задания
                  </small>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </PageState>
  );
}
