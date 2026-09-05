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
import { Profile } from "./features/member/profile";
import { CarePlans } from "./features/member/carePlans";
import { CarePlanDetails } from "./features/member/carePlanDetails";
import { CheckIns } from "./features/member/checkIns";
import { CareGiverMembers } from "./features/caregiver/members";
import { MemberDetailsPage } from "./features/caregiver/member_details";
import { CaregiverTasks } from "./features/caregiver/tasks";
import { CaregiverCheckIns } from "./features/caregiver/checkins";
import { Assistant } from "./features/member/assistant";
import { AdminUsers } from "./features/admin/users";

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

          <Route path="profile" element={<Profile />} />
          <Route path="dashboard/member" element={<MemberDashboard />} />
          <Route path="care-plans" element={<CarePlans />} />
          <Route path="care-plans/:carePlanId" element={<CarePlanDetails />} />
          <Route path="check-ins" element={<CheckIns />} />
          <Route path="assistant" element={<Assistant />} />


          <Route path="dashboard/caregiver" element={<CaregiverDashboard />} />
          <Route path="caregiver/members" element={<CareGiverMembers />} />
          <Route path="caregiver/members/:memberId" element={<MemberDetailsPage />} />
          <Route path="caregiver/tasks" element={<CaregiverTasks />} />
          <Route path="caregiver/check-ins" element={<CaregiverCheckIns />} />

          <Route path="dashboard/admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUsers />} />

          <Route path="goals" element={<Placeholder />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
