import { CalendarOutlined } from "@ant-design/icons";
import { List, Space, Tag } from "antd";
import { Link } from "react-router-dom";

import type { Assignment } from "../../entities/assignment/model";
import {
  formatDate,
  isOverdue,
  statusInfo,
  typeInfo,
} from "../../entities/assignment/model";
import type { Course } from "../../entities/course/model";
import { PageState } from "./PageState";


export function AssignmentTags({ item }: { item: Assignment }) {
  return (
    <Space size={[6, 6]} wrap>
      <Tag>{typeInfo[item.type]}</Tag>
      <Tag color={statusInfo[item.status].color}>
        {statusInfo[item.status].label}
      </Tag>
      {isOverdue(item) && <Tag color="error">Просрочено</Tag>}
    </Space>
  );
}

export function AssignmentList({
  items,
  courses,
  emptyText,
}: {
  items: Assignment[];
  courses: Course[];
  emptyText?: string;
}) {
  return (
    <PageState empty={!items.length} emptyText={emptyText}>
      <List
        className="assignment-list"
        dataSource={items}
        renderItem={(item) => (
          <List.Item className="list-enter">
            <Link to={`/assignments/${item.id}`} className="assignment-row">
              <div>
                <b>{item.title}</b>
                <span>
                  {courses.find((course) => course.id === item.courseId)?.title}
                  {" · "}
                  <CalendarOutlined /> {formatDate(item.deadline)}
                </span>
              </div>
              <AssignmentTags item={item} />
            </Link>
          </List.Item>
        )}
      />
    </PageState>
  );
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
