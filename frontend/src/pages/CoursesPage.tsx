import { BookOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Empty } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useDemoData } from "../app/providers/DemoDataProvider";
import { CourseModal } from "../features/course/CourseModal";
import { PageState } from "../shared/ui/PageState";


export function CoursesPage() {
  const { courses, assignments, isLoading, error, addCourse } = useDemoData();
  const { message } = App.useApp();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <PageState loading={isLoading} error={error}>
      <div className="page-actions">
        <p>Все учебные курсы и закреплённые за ними работы.</p>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Новый курс
        </Button>
      </div>
      {courses.length ? (
        <div className="course-grid">
          {courses.map((course) => (
            <article className="course-card list-enter" key={course.id}>
              <div
                className="course-card-line"
                style={{ background: course.accent }}
              />
              <div className="course-card-body">
                <span className="course-icon">
                  <BookOutlined />
                </span>
                <h2>{course.title}</h2>
                <p>{course.description || "Описание не добавлено"}</p>
                <div className="course-card-foot">
                  <span>
                    {assignments.filter((item) => item.courseId === course.id)
                      .length}{" "}
                    задания
                  </span>
                  <Link to={`/courses/${course.id}`}>Открыть →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty description="Создайте первый курс" />
      )}
      <CourseModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSave={(data) => {
          addCourse(data);
          void message.success("Курс добавлен");
        }}
      />
    </PageState>
  );
}
