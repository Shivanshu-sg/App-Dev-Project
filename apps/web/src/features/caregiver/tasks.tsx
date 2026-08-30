import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

type TaskType = "exercise" | "routine" | "therapy" | "selfcare" | "other";
type TaskPriority = "low" | "med" | "high";
type TaskStatus = "pending" | "done" | "missed" | "skipped";

type CaregiverTask = {
  id: string;
  carePlanId: string;
  carePlanTitle: string;
  memberId: string;
  memberName: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  scheduledTime: string | null;
  frequency: string | null;
  nextCheckIn: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

type CaregiverTasksResponse = {
  data: CaregiverTask[];
};

type StatusFilter = "all" | TaskStatus;
type PriorityFilter = "all" | TaskPriority;

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString();
}

export function CaregiverTasks() {
  const [tasks, setTasks] = useState<CaregiverTask[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<CaregiverTasksResponse>("/caregiver/tasks");
      setTasks(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tasks");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const text = `${task.title} ${task.memberName} ${task.carePlanTitle}`
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  return (
    <main className="caregiver-tasks-page">
      <section className="caregiver-tasks-header">
        <div>
          <h1>Tasks</h1>
          <p>Monitor care tasks across all members.</p>
        </div>
      </section>

      <section className="caregiver-tasks-toolbar">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task, member, or care plan"
          />
        </label>

        <label>
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="missed">Missed</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>

        <label>
          Priority
          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as PriorityFilter)
            }
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="med">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="caregiver-task-list">
        {isLoading ? <p>Loading tasks...</p> : null}

        {!isLoading && filteredTasks.length === 0 ? <p>No tasks found.</p> : null}

        {filteredTasks.map((task) => (
          <article className="caregiver-task-card" key={task.id}>
            <div>
              <h2>{task.title}</h2>
              <p>{task.description || "No description added."}</p>
            </div>

            <dl>
              <div>
                <dt>Member</dt>
                <dd>
                  <Link to={`/caregiver/members/${task.memberId}`}>
                    {task.memberName}
                  </Link>
                </dd>
              </div>

              <div>
                <dt>Care plan</dt>
                <dd>{task.carePlanTitle}</dd>
              </div>

              <div>
                <dt>Type</dt>
                <dd>{task.taskType}</dd>
              </div>

              <div>
                <dt>Scheduled</dt>
                <dd>{formatDateTime(task.scheduledTime)}</dd>
              </div>

              <div>
                <dt>Next check-in</dt>
                <dd>{formatDateTime(task.nextCheckIn)}</dd>
              </div>

              <div>
                <dt>Frequency</dt>
                <dd>{task.frequency || "Not set"}</dd>
              </div>
            </dl>

            <div className="caregiver-task-meta">
              <span className={`task-priority priority-${task.priority}`}>
                {task.priority}
              </span>

              <span className={`task-status task-status-${task.status}`}>
                {task.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}