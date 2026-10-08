import { Button, Form, Input, Modal } from "antd";
import { useEffect } from "react";

import type { Course, CourseInput } from "../../entities/course/model";


export function CourseModal({
  open,
  course,
  onCancel,
  onSave,
}: {
  open: boolean;
  course?: Course;
  onCancel: () => void;
  onSave: (data: CourseInput) => void;
}) {
  const [form] = Form.useForm<CourseInput>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        course ?? { title: "", description: "" },
      );
    }
  }, [course, form, open]);

  return (
    <Modal
      open={open}
      title={course ? "Изменить курс" : "Новый курс"}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSave(values);
          onCancel();
        }}
      >
        <Form.Item
          name="title"
          label="Название курса"
          rules={[
            { required: true, message: "Введите название курса" },
            { max: 120, message: "Не больше 120 символов" },
          ]}
        >
          <Input placeholder="Например, Базы данных" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Описание"
          rules={[{ max: 2000, message: "Не больше 2000 символов" }]}
        >
          <Input.TextArea rows={3} placeholder="Кратко опишите курс" />
        </Form.Item>
        <div className="modal-actions">
          <Button onClick={onCancel}>Отмена</Button>
          <Button type="primary" htmlType="submit">
            Сохранить
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
