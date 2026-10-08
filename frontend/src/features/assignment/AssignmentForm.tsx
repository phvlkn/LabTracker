import { FileAddOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Select, Space } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect } from "react";

import {
  statusInfo,
  typeInfo,
  type Assignment,
  type AssignmentInput,
} from "../../entities/assignment/model";
import type { Course } from "../../entities/course/model";


interface FormValues extends Omit<AssignmentInput, "deadline"> {
  deadline: Dayjs | null;
}

export function AssignmentForm({
  courses,
  assignment,
  initialCourseId,
  onSubmit,
  onCancel,
}: {
  courses: Course[];
  assignment?: Assignment;
  initialCourseId?: number;
  onSubmit: (data: AssignmentInput) => void;
  onCancel: () => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const maxGrade = Form.useWatch("maxGrade", form) ?? 10;

  useEffect(() => {
    form.setFieldsValue({
      courseId: assignment?.courseId ?? initialCourseId,
      title: assignment?.title ?? "",
      description: assignment?.description ?? "",
      type: assignment?.type ?? "lab",
      status: assignment?.status ?? "not_started",
      deadline: assignment?.deadline ? dayjs(assignment.deadline) : null,
      maxGrade: assignment?.maxGrade ?? 10,
      grade: assignment?.grade ?? null,
    });
  }, [assignment, form, initialCourseId]);

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      requiredMark="optional"
      onFinish={(values) =>
        onSubmit({
          ...values,
          description: values.description ?? "",
          deadline: values.deadline?.toISOString() ?? null,
          grade: values.grade ?? null,
        })
      }
    >
      <div className="form-grid">
        <Form.Item
          name="title"
          label="Название"
          rules={[
            { required: true, message: "Введите название задания" },
            { max: 160, message: "Не больше 160 символов" },
          ]}
        >
          <Input placeholder="Например, Лабораторная работа №3" />
        </Form.Item>
        <Form.Item
          name="courseId"
          label="Курс"
          rules={[{ required: true, message: "Выберите курс" }]}
        >
          <Select
            placeholder="Выберите курс"
            options={courses.map((course) => ({
              value: course.id,
              label: course.title,
            }))}
          />
        </Form.Item>
        <Form.Item name="type" label="Тип работы">
          <Select
            options={Object.entries(typeInfo).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </Form.Item>
        <Form.Item name="status" label="Статус">
          <Select
            options={Object.entries(statusInfo).map(([value, info]) => ({
              value,
              label: info.label,
            }))}
          />
        </Form.Item>
        <Form.Item name="deadline" label="Дедлайн">
          <DatePicker showTime placeholder="Выберите дату" />
        </Form.Item>
        <Form.Item
          name="maxGrade"
          label="Максимальная оценка"
          rules={[{ required: true, message: "Укажите шкалу" }]}
        >
          <InputNumber min={1} max={1000} />
        </Form.Item>
        <Form.Item
          name="grade"
          label="Оценка"
          dependencies={["maxGrade"]}
          rules={[
            {
              validator: (_, value: number | null) =>
                value == null || (value >= 0 && value <= maxGrade)
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(`Оценка должна быть от 0 до ${maxGrade}`),
                    ),
            },
          ]}
        >
          <InputNumber min={0} max={maxGrade} step={0.1} />
        </Form.Item>
      </div>
      <Form.Item
        name="description"
        label="Описание"
        rules={[{ max: 4000, message: "Не больше 4000 символов" }]}
      >
        <Input.TextArea rows={4} placeholder="Что требуется выполнить" />
      </Form.Item>
      <Space>
        <Button type="primary" htmlType="submit" icon={<FileAddOutlined />}>
          Сохранить
        </Button>
        <Button onClick={onCancel}>Отмена</Button>
      </Space>
    </Form>
  );
}
