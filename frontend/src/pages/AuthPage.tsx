import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../app/providers/AuthProvider";


interface AuthValues {
  email: string;
  username?: string;
  password: string;
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (values: AuthValues) => {
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        await register(values.email, values.username ?? "", values.password);
      }
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? "/", { replace: true });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось выполнить запрос",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card page-enter">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">L</span>
          <span>LabTracker</span>
        </Link>
        <p className="eyebrow">Персональный учебный трекер</p>
        <h1>{isLogin ? "Вход" : "Регистрация"}</h1>
        <p className="auth-description">
          {isLogin
            ? "Войдите, чтобы продолжить работу со своими курсами."
            : "Создайте аккаунт для доступа к личному пространству."}
        </p>
        {error && <Alert type="error" showIcon message={error} />}
        <Form<AuthValues> layout="vertical" onFinish={submit}>
          {!isLogin && (
            <Form.Item
              name="username"
              label="Имя"
              rules={[
                { required: true, message: "Введите имя" },
                { min: 2, message: "Минимум 2 символа" },
              ]}
            >
              <Input prefix={<UserOutlined />} autoComplete="name" />
            </Form.Item>
          )}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input prefix={<MailOutlined />} autoComplete="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: "Введите пароль" },
              { min: 8, message: "Минимум 8 символов" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </Form.Item>
          <Button block type="primary" htmlType="submit" loading={submitting}>
            {isLogin ? "Войти" : "Создать аккаунт"}
          </Button>
        </Form>
        <p className="auth-switch">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <Link to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </Link>
        </p>
      </section>
    </main>
  );
}
