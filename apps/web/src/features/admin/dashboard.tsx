import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

type AdminDashboardData = {
  totalUsers: number;
  totalMembers: number;
  totalCaregivers: number;
  totalAdmins: number;
  activeUsers: number;
  totalCarePlans: number;
  activeCarePlans: number;
  totalTasks: number;
  pendingTasks: number;
  missedTasks: number;
  totalCheckIns: number;
  missedCheckIns: number;
  totalAssignments: number;
  unassignedMembers: number;
  totalCaregiverNotes: number;
  recentUsers: {
    id: string;
    email: string;
    role: "member" | "caregiver" | "admin";
    isActive: boolean;
    createdAt: string;
  }[];
  recentCheckIns: {
    id: string;
    memberEmail: string;
    carePlanTitle: string;
    taskTitle: string;
    status: "pending" | "done" | "missed" | "skipped";
    checkInDate: string;
  }[];
};

type AdminDashboardResponse = {
  data: AdminDashboardData;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const result = await api<AdminDashboardResponse>("/admin/dashboard");
        setDashboard(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load admin dashboard",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <main>
        <h1>Admin dashboard</h1>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main>
        <h1>Admin dashboard</h1>
        <p className="auth-error">
          {error || "Admin dashboard could not be loaded."}
        </p>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">
      <section className="admin-dashboard-header">
        <div>
          <h1>Admin dashboard</h1>
          <p>Monitor users, care plans, tasks, check-ins, and caregiver activity.</p>
        </div>
      </section>

      <section className="admin-summary-grid">
        <article>
          <span>Total users</span>
          <strong>{dashboard.totalUsers}</strong>
        </article>

        <article>
          <span>Members</span>
          <strong>{dashboard.totalMembers}</strong>
        </article>

        <article>
          <span>Caregivers</span>
          <strong>{dashboard.totalCaregivers}</strong>
        </article>

        <article>
          <span>Care plans</span>
          <strong>{dashboard.totalCarePlans}</strong>
        </article>

        <article>
          <span>Pending tasks</span>
          <strong>{dashboard.pendingTasks}</strong>
        </article>

        <article>
          <span>Missed check-ins</span>
          <strong>{dashboard.missedCheckIns}</strong>
        </article>

        <article>
          <span>Assignments</span>
          <strong>{dashboard.totalAssignments}</strong>
        </article>

        <article>
          <span>Unassigned members</span>
          <strong>{dashboard.unassignedMembers}</strong>
        </article>
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel">
          <div className="panel-heading">
            <h2>User breakdown</h2>
            <Link to="/admin/users">Manage users</Link>
          </div>

          <dl className="admin-breakdown-list">
            <div>
              <dt>Active users</dt>
              <dd>{dashboard.activeUsers}</dd>
            </div>

            <div>
              <dt>Admins</dt>
              <dd>{dashboard.totalAdmins}</dd>
            </div>

            <div>
              <dt>Active care plans</dt>
              <dd>{dashboard.activeCarePlans}</dd>
            </div>

            <div>
              <dt>Total tasks</dt>
              <dd>{dashboard.totalTasks}</dd>
            </div>

            <div>
              <dt>Missed tasks</dt>
              <dd>{dashboard.missedTasks}</dd>
            </div>

            <div>
              <dt>Caregiver notes</dt>
              <dd>{dashboard.totalCaregiverNotes}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-panel">
          <div className="panel-heading">
            <h2>Recent users</h2>
            <Link to="/admin/users">View all</Link>
          </div>

          <div className="admin-list">
            {dashboard.recentUsers.map((user) => (
              <div className="admin-list-row" key={user.id}>
                <div>
                  <strong>{user.email}</strong>
                  <span>{user.role}</span>
                </div>

                <span
                  className={
                    user.isActive
                      ? "admin-status active"
                      : "admin-status inactive"
                  }
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel full-panel">
          <div className="panel-heading">
            <h2>Recent check-ins</h2>
            <Link to="/admin/check-ins">View all</Link>
          </div>

          <div className="admin-list">
            {dashboard.recentCheckIns.map((checkIn) => (
              <div className="admin-checkin-row" key={checkIn.id}>
                <div>
                  <strong>{checkIn.taskTitle}</strong>
                  <span>{checkIn.memberEmail}</span>
                </div>

                <span>{checkIn.carePlanTitle}</span>

                <span className={`task-status task-status-${checkIn.status}`}>
                  {checkIn.status}
                </span>

                <span>{formatDate(checkIn.checkInDate)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}