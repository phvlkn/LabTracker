import { Spin } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./providers/AuthProvider";


export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spin fullscreen tip="Проверяем сессию" />;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <Spin fullscreen tip="Проверяем сессию" />;
  }
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
