import { LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, Tooltip } from "antd";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../app/providers/AuthProvider";


export function AppShell() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const title =
    location.pathname === "/"
      ? "Сводка"
      : location.pathname.startsWith("/courses")
        ? "Курсы"
        : "Задания";

  return (
    <Layout className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">L</span>
          <span>LabTracker</span>
        </Link>
        <nav>
          <NavLink to="/" end>
            Сводка
          </NavLink>
          <NavLink to="/courses">Курсы</NavLink>
          <NavLink to="/assignments">Задания</NavLink>
        </nav>
        <div className="user-area">
          <Tooltip title={user?.email}>
            <div className="profile">{user?.username.slice(0, 2).toUpperCase()}</div>
          </Tooltip>
          <Button
            type="text"
            aria-label="Выйти"
            icon={<LogoutOutlined />}
            onClick={() => void logout()}
          />
        </div>
      </header>
      <main className="page page-enter">
        <div className="page-title">
          <div>
            <p className="eyebrow">Учебный семестр · осень 2026</p>
            <h1>{title}</h1>
          </div>
          <p className="muted">{user?.username}</p>
        </div>
        <Outlet />
      </main>
    </Layout>
  );
}
