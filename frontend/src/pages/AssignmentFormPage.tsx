import { ArrowLeftOutlined } from "@ant-design/icons";
import { App } from "antd";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useDemoData } from "../app/providers/DemoDataProvider";
import { AssignmentForm } from "../features/assignment/AssignmentForm";
import { PageState } from "../shared/ui/PageState";


export function AssignmentFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const {
    courses,
    assignments,
    isLoading,
    error,
    addAssignment,
    updateAssignment,
  } = useDemoData();
  const assignment = assignments.find((item) => item.id === Number(id));
  const editing = Boolean(id);

  if (editing && !isLoading && !assignment) {
    return (
      <PageState empty emptyText="Задание не найдено">
        <span />
      </PageState>
    );
  }

  return (
    <PageState
      loading={isLoading}
      error={error}
      empty={!courses.length}
      emptyText="Сначала создайте хотя бы один курс"
    >
      <Link
        to={editing ? `/assignments/${id}` : "/assignments"}
        className="back"
      >
        <ArrowLeftOutlined /> Назад
      </Link>
      <section className="form-card">
        <div>
          <p className="eyebrow">{editing ? "Редактирование" : "Новое задание"}</p>
          <h2>{editing ? "Изменить задание" : "Добавить задание"}</h2>
          <p className="muted">Изменения сохраняются в демонстрационном хранилище.</p>
        </div>
        <AssignmentForm
          courses={courses}
          assignment={assignment}
          initialCourseId={Number(searchParams.get("course")) || undefined}
          onCancel={() => navigate(editing ? `/assignments/${id}` : "/assignments")}
          onSubmit={(data) => {
            if (assignment) {
              updateAssignment(assignment.id, data);
              void message.success("Задание обновлено");
              navigate(`/assignments/${assignment.id}`);
            } else {
              const newId = addAssignment(data);
              void message.success("Задание добавлено");
              navigate(`/assignments/${newId}`);
            }
          }}
        />
      </section>
    </PageState>
  );
}
