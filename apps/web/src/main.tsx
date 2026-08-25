import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { AuthenticatedUser } from "@lifely/contracts";
import { App } from "./App";
import "./styles/global.css";
import { RegisterPage, getDashboardPath } from "./features/auth/RegisterPage";
import { MemberDashboard } from "./features/member/dashboard";
import { CaregiverDashboard } from "./features/caregiver/dashboard";
import {AdminDashboard } from "./features/admin/dashboard";
import LoginPage from "./features/auth/LoginPage";

const Placeholder = () => {
  return (
    <main>
      <h1>Coming next</h1>
      <p>This feature is ready for its domain module.</p>
    </main>
  );
};

const StartPage = () => {
  const storedUser = localStorage.getItem("lifely_user");
  const user = storedUser ? (JSON.parse(storedUser) as AuthenticatedUser) : null;

  if (!user) return <Navigate to="/register" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<StartPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          {/* <Route path="dashboard" element={<DashboardPage />} /> */}
          <Route path="dashboard/member" element={<MemberDashboard />} />
          <Route path="dashboard/caregiver" element={<CaregiverDashboard />} />
          <Route path="dashboard/admin" element={<AdminDashboard />} />
          <Route path="care-plans" element={<Placeholder />} />
          <Route path="check-ins" element={<Placeholder />} />
          <Route path="goals" element={<Placeholder />} />
          <Route path="assistant" element={<Placeholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
