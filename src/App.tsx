import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import Dashboard from "@/Pages/Dashboard.tsx";
import {BookOpen, ClipboardList, GraduationCap, Home, Users, Building2} from "lucide-react";
import { Layout } from "@/components/refine-ui/layout/layout.tsx";
import SubjectsCreate from "@/Pages/Subjects/create.tsx";
import SubjectList from "@/Pages/Subjects/list.tsx";
import SubjectsEdit from "@/Pages/Subjects/edit.tsx";
import SubjectsShow from "@/Pages/Subjects/show.tsx";
import { SignInForm } from "@/components/refine-ui/form/sign-in-form.tsx";
import { SignUpForm } from "@/components/refine-ui/form/sign-up-form.tsx";
import { authProvider } from "@/providers/auth";

import ClassesCreate from "@/Pages/classes/create.tsx";
import ClassesEdit from "@/Pages/classes/edit.tsx";
import ClassesShow from "@/Pages/classes/show.tsx";
import ClassesList from "@/Pages/classes/list.tsx";
import UsersList from "@/Pages/Users/list.tsx";
import UsersCreate from "@/Pages/Users/create.tsx";
import UsersEdit from "@/Pages/Users/edit.tsx";
import UsersShow from "@/Pages/Users/show.tsx";
import DepartmentsList from "@/Pages/Departments/list.tsx";
import DepartmentsCreate from "@/Pages/Departments/create.tsx";
import DepartmentsEdit from "@/Pages/Departments/edit.tsx";
import DepartmentsShow from "@/Pages/Departments/show.tsx";
import EnrollmentsList from "@/Pages/Enrollments/list.tsx";

import.meta.env.VITE_BACKEND_BASE_URL

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              authProvider={authProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "gdXSIg-LLNfUx-33QsJr",
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Home", icon: <Home /> },
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  edit: "/subjects/edit/:id",
                  show: "/subjects/show/:id",
                  meta: { label: "Subjects", icon: <BookOpen /> },
                },
                {
                  name: "users",
                  list: "/users",
                  create: "/users/create",
                  edit: "/users/edit/:id",
                  show: "/users/show/:id",
                  meta: { label: "Users", icon: <Users /> },
                },
                {
                  name: "departments",
                  list: "/departments",
                  create: "/departments/create",
                  edit: "/departments/edit/:id",
                  show: "/departments/show/:id",
                  meta: { label: "Departments", icon: <Building2 /> },
                },
                // Classes resource routes and nav metadata.
                {
                  name: "classes",
                  list: "/classes",
                  create: "/classes/create",
                  edit: "/classes/edit/:id",
                  show:'/classes/show/:id',
                  meta: { label: "Classes", icon: <GraduationCap /> },
                },
                {
                  name: "enrollments",
                  list: "/enrollments",
                  meta: { label: "Enrollments", icon: <ClipboardList /> },
                },

              ]}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated key="app-auth" fallback={<Navigate to="/login" />}>
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route path="/" element={<Dashboard />} />

                  <Route path="subjects">
                    <Route index element={<SubjectList />} />
                    <Route path="create" element={<SubjectsCreate />} />
                    <Route path="edit/:id" element={<SubjectsEdit />} />
                    <Route path="show/:id" element={<SubjectsShow />} />
                  </Route>
                  <Route path="users">
                    <Route index element={<UsersList />} />
                    <Route path="create" element={<UsersCreate />} />
                    <Route path="edit/:id" element={<UsersEdit />} />
                    <Route path="show/:id" element={<UsersShow />} />
                  </Route>
                  <Route path="departments">
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={<DepartmentsCreate />} />
                    <Route path="edit/:id" element={<DepartmentsEdit />} />
                    <Route path="show/:id" element={<DepartmentsShow />} />
                  </Route>
                  <Route path="classes">
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={<ClassesCreate />} />
                    <Route path="edit/:id" element={<ClassesEdit />} />
                    <Route path="show/:id" element={<ClassesShow/>} />
                  </Route>
                  <Route path="enrollments">
                    <Route index element={<EnrollmentsList />} />
                  </Route>
                </Route>
                <Route path="/login" element={<SignInForm />} />
                <Route path="/register" element={<SignUpForm />} />
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
