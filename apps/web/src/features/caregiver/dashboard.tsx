import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

type DashboardData = {
  assignedMembers: number;
  activeCarePlans: number;
  pendingTasks: number;
  missedCheckIns: number;
  todayCheckIns: number;
  membersNeedingAttention: {
    id: string;
    name: string;
    email: string | null;
    pendingTasks: number;
    missedCheckIns: number;
  }[];
  recentCheckIns: {
    id: string;
    memberId: string;
    carePlanTitle: string;
    taskTitle: string;
    status: "pending" | "done" | "missed" | "skipped";
    checkInDate: string;
    notes: string | null;
  }[];
  highPriorityTasks: {
    id: string;
    carePlanId: string;
    carePlanTitle: string;
    memberId: string;
    title: string;
    scheduledTime: string | null;
    priority: "low" | "med" | "high";
    status: "pending" | "done" | "missed" | "skipped";
  }[];
};

type DashboardResponse = {
  data: DashboardData;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString();
}

export function CaregiverDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const result = await api<DashboardResponse>("/caregiver/dashboard");
        setDashboard(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load dashboard",
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
        <h1>Caregiver dashboard</h1>
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main>
        <h1>Caregiver dashboard</h1>
        <p className="auth-error">{error || "Dashboard could not be loaded."}</p>
      </main>
    );
  }

  return (
    <main className="caregiver-dashboard-page">
      <section className="caregiver-dashboard-header">
        <div>
          <h1>Caregiver dashboard</h1>
          <p>Monitor assigned members, care plans, tasks, and check-ins.</p>
        </div>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="caregiver-summary-grid">
        <article>
          <span>Assigned members</span>
          <strong>{dashboard.assignedMembers}</strong>
        </article>

        <article>
          <span>Active care plans</span>
          <strong>{dashboard.activeCarePlans}</strong>
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
          <span>Today check-ins</span>
          <strong>{dashboard.todayCheckIns}</strong>
        </article>
      </section>

      <section className="caregiver-dashboard-grid">
        <article className="caregiver-panel">
          <div className="panel-heading">
            <h2>Needs attention</h2>
            <Link to="/caregiver/members">View members</Link>
          </div>

          {dashboard.membersNeedingAttention.length === 0 ? (
            <p>No members need attention right now.</p>
          ) : null}

          <div className="attention-list">
            {dashboard.membersNeedingAttention.map((member) => (
              <Link
                className="attention-row"
                to={`/caregiver/members/${member.id}`}
                key={member.id}
              >
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.email}</span>
                </div>

                <p>
                  {member.pendingTasks} pending, {member.missedCheckIns} missed
                </p>
              </Link>
            ))}
          </div>
        </article>

        <article className="caregiver-panel">
          <div className="panel-heading">
            <h2>High priority tasks</h2>
            <Link to="/caregiver/tasks">View tasks</Link>
          </div>

          {dashboard.highPriorityTasks.length === 0 ? (
            <p>No high priority tasks.</p>
          ) : null}

          <div className="dashboard-task-list">
            {dashboard.highPriorityTasks.map((task) => (
              <div className="dashboard-task-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.carePlanTitle}</span>
                </div>

                <p>{formatDateTime(task.scheduledTime)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="caregiver-panel full-panel">
          <div className="panel-heading">
            <h2>Recent check-ins</h2>
            <Link to="/caregiver/check-ins">View check-ins</Link>
          </div>

          {dashboard.recentCheckIns.length === 0 ? (
            <p>No check-ins yet.</p>
          ) : null}

          <div className="dashboard-checkin-list">
            {dashboard.recentCheckIns.map((checkIn) => (
              <div className="dashboard-checkin-row" key={checkIn.id}>
                <div>
                  <strong>{checkIn.taskTitle}</strong>
                  <span>{checkIn.carePlanTitle}</span>
                </div>

                <span className={`task-status task-status-${checkIn.status}`}>
                  {checkIn.status}
                </span>

                <p>{formatDate(checkIn.checkInDate)}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}