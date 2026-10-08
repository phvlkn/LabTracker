import {
  ArrowLeftOutlined,
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { App, Button } from "antd";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useDemoData } from "../app/providers/DemoDataProvider";
import { CourseModal } from "../features/course/CourseModal";
import { AssignmentList, Panel } from "../shared/ui/AssignmentList";
import { PageState } from "../shared/ui/PageState";


export function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const {
    courses,
    assignments,
    isLoading,
    error,
    updateCourse,
    deleteCourse,
  } = useDemoData();
  const [editOpen, setEditOpen] = useState(false);
  const course = courses.find((item) => item.id === Number(id));
  const items = assignments.filter((item) => item.courseId === Number(id));

  if (!isLoading && !course) {
    return (
      <PageState empty emptyText="Курс не найден">
        <span />
      </PageState>
    );
  }

  return (
    <PageState loading={isLoading} error={error}>
      {course && (
        <>
          <Link to="/courses" className="back">
            <ArrowLeftOutlined /> Все курсы
          </Link>
          <section className="course-hero">
            <span className="hero-square" style={{ background: course.accent }}>
              <BookOutlined />
            </span>
            <div>
              <p className="eyebrow">Курс</p>
              <h2>{course.title}</h2>
              <p>{course.description || "Описание не добавлено"}</p>
            </div>
            <div className="hero-actions">
              <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
                Изменить
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  modal.confirm({
                    title: "Удалить курс?",
                    content: "Все задания этого курса также будут удалены.",
                    okText: "Удалить",
                    cancelText: "Отмена",
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteCourse(course.id);
                      void message.success("Курс удалён");
                      navigate("/courses");
                    },
                  })
                }
              >
                Удалить
              </Button>
            </div>
          </section>
          <Panel
            title="Задания курса"
            action={
              <Link to={`/assignments/new?course=${course.id}`}>
                <Button type="primary" icon={<PlusOutlined />}>
                  Добавить задание
                </Button>
              </Link>
            }
          >
            <AssignmentList items={items} courses={courses} />
          </Panel>
          <CourseModal
            open={editOpen}
            course={course}
            onCancel={() => setEditOpen(false)}
            onSave={(data) => {
              updateCourse(course.id, data);
              void message.success("Курс обновлён");
            }}
          />
        </>
      )}
    </PageState>
  );
}
