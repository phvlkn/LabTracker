import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { App, Button, Select, Space } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useDemoData } from "../app/providers/DemoDataProvider";
import {
  formatDate,
  statusInfo,
  type AssignmentStatus,
} from "../entities/assignment/model";
import { AssignmentTags } from "../shared/ui/AssignmentList";
import { PageState } from "../shared/ui/PageState";


export function AssignmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const {
    courses,
    assignments,
    isLoading,
    error,
    updateAssignment,
    deleteAssignment,
  } = useDemoData();
  const item = assignments.find((assignment) => assignment.id === Number(id));
  const course = courses.find((value) => value.id === item?.courseId);

  if (!isLoading && !item) {
    return (
      <PageState empty emptyText="Задание не найдено">
        <span />
      </PageState>
    );
  }

  return (
    <PageState loading={isLoading} error={error}>
      {item && (
        <>
          <Link to="/assignments" className="back">
            <ArrowLeftOutlined /> Все задания
          </Link>
          <article className="assignment-detail">
            <div className="detail-heading">
              <div>
                <p className="eyebrow">{course?.title}</p>
                <h2>{item.title}</h2>
                <AssignmentTags item={item} />
              </div>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/assignments/${item.id}/edit`)}
                >
                  Изменить
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    modal.confirm({
                      title: "Удалить задание?",
                      okText: "Удалить",
                      cancelText: "Отмена",
                      okButtonProps: { danger: true },
                      onOk: () => {
                        deleteAssignment(item.id);
                        void message.success("Задание удалено");
                        navigate("/assignments");
                      },
                    })
                  }
                >
                  Удалить
                </Button>
              </Space>
            </div>
            <div className="quick-status">
              <span>Быстрая смена статуса</span>
              <Select
                value={item.status}
                onChange={(status: AssignmentStatus) => {
                  updateAssignment(item.id, { status });
                  void message.success("Статус обновлён");
                }}
                options={Object.entries(statusInfo).map(([value, info]) => ({
                  value,
                  label: info.label,
                }))}
              />
            </div>
            <div className="detail-grid">
              <div>
                <p className="detail-label">Описание</p>
                <p>{item.description || "Описание не добавлено"}</p>
              </div>
              <div>
                <p className="detail-label">Дедлайн</p>
                <p>{formatDate(item.deadline)}</p>
              </div>
              <div>
                <p className="detail-label">Оценка</p>
                <p>
                  {item.grade ?? "Не выставлена"}{" "}
                  <span className="muted">из {item.maxGrade}</span>
                </p>
              </div>
            </div>
          </article>
        </>
      )}
    </PageState>
  );
}
