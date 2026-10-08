import { App as AntApp, Empty } from "antd";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AssignmentDetailsPage } from "../pages/AssignmentDetailsPage";
import { AssignmentFormPage } from "../pages/AssignmentFormPage";
import { AssignmentsPage } from "../pages/AssignmentsPage";
import { AuthPage } from "../pages/AuthPage";
import { CourseDetailsPage } from "../pages/CourseDetailsPage";
import { CoursesPage } from "../pages/CoursesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { AppShell } from "../shared/ui/AppShell";
import { ProtectedRoute, PublicOnlyRoute } from "./ProtectedRoute";
import { AuthProvider } from "./providers/AuthProvider";
import { DemoDataProvider } from "./providers/DemoDataProvider";


export function App() {
  return (
    <BrowserRouter>
      <AntApp>
        <AuthProvider>
          <DemoDataProvider>
            <Routes>
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:id" element={<CourseDetailsPage />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/assignments/new" element={<AssignmentFormPage />} />
                  <Route
                    path="/assignments/:id/edit"
                    element={<AssignmentFormPage />}
                  />
                  <Route
                    path="/assignments/:id"
                    element={<AssignmentDetailsPage />}
                  />
                </Route>
              </Route>
              <Route path="*" element={<Empty description="Страница не найдена" />} />
            </Routes>
          </DemoDataProvider>
        </AuthProvider>
      </AntApp>
    </BrowserRouter>
  );
}
