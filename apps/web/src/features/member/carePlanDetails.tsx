import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import { MemberCaregiverNotes } from "./notes";

type CarePlanStatus = "active" | "paused" | "completed";
type TaskType = "exercise" | "routine" | "therapy" | "selfcare" | "other";
type TaskPriority = "low" | "med" | "high";
type TaskStatus = "pending" | "done" | "missed" | "skipped";

type Caregiver = {
  id: string;
  name: string;
};

type CaregiverAssignment = {
  id: string;
  caregiverId: string;
  caregiver: Caregiver;
};

type CarePlan = {
  id: string;
  title: string;
  description: string | null;
  conditionFocus: string | null;
  startDate: string;
  endDate: string | null;
  status: CarePlanStatus;
  caregiverAssignments: CaregiverAssignment[];
};

type CarePlanTask = {
  id: string;
  carePlanId: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  scheduledTime: string | null;
  frequency: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

type CarePlanResponse = {
  data: CarePlan;
};

type TasksResponse = {
  data: CarePlanTask[];
};

type TaskResponse = {
  data: CarePlanTask;
};

type TaskForm = {
  title: string;
  description: string;
  taskType: TaskType;
  scheduledTime: string;
  frequency: string;
  priority: TaskPriority;
  status: TaskStatus;
};

const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  taskType: "routine",
  scheduledTime: "",
  frequency: "",
  priority: "med",
  status: "pending",
};

export function CarePlanDetails() {
  const { carePlanId } = useParams();
  const [carePlan, setCarePlan] = useState<CarePlan | null>(null);
  const [tasks, setTasks] = useState<CarePlanTask[]>([]);
  const [form, setForm] = useState<TaskForm>(emptyTaskForm);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCarePlanDetails() {
    if (!carePlanId) return;

    setIsLoading(true);
    setError("");

    try {
      const [carePlanResult, tasksResult] = await Promise.all([
        api<CarePlanResponse>(`/member/care-plans/${carePlanId}`),
        api<TasksResponse>(`/member/care-plans-tasks/${carePlanId}/tasks`),
      ]);

      setCarePlan(carePlanResult.data);
      setTasks(tasksResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load care plan");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCarePlanDetails();
  }, [carePlanId]);

  function updateField<K extends keyof TaskForm>(field: K, value: TaskForm[K]) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function openAddTaskPopup() {
    setForm(emptyTaskForm);
    setEditingTaskId(null);
    setMessage("");
    setError("");
    setIsTaskPopupOpen(true);
  }

  function openEditTaskPopup(task: CarePlanTask) {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      taskType: task.taskType,
      scheduledTime: task.scheduledTime ? task.scheduledTime.slice(0, 16) : "",
      frequency: task.frequency ?? "",
      priority: task.priority,
      status: task.status,
    });
    setMessage("");
    setError("");
    setIsTaskPopupOpen(true);
  }

  function closeTaskPopup() {
    setForm(emptyTaskForm);
    setEditingTaskId(null);
    setIsTaskPopupOpen(false);
  }

  async function deleteTask(taskId: string) {
    if (!carePlanId) return;

    const shouldDelete = window.confirm("Delete this task?");
    if (!shouldDelete) return;

    setError("");
    setMessage("");

    try {
      await api<{ data: { deleted: boolean } }>(
        `/member/care-plans-tasks/${carePlanId}/tasks/${taskId}`,
        { method: "DELETE" },
      );

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );

      setMessage("Task deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!carePlanId) return;

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        description: form.description || null,
        scheduledTime: form.scheduledTime || null,
        frequency: form.frequency || null,
      };

      const path = editingTaskId
        ? `/member/care-plans-tasks/${carePlanId}/tasks/${editingTaskId}`
        : `/member/care-plans-tasks/${carePlanId}/tasks`;

      const method = editingTaskId ? "PUT" : "POST";

      const result = await api<TaskResponse>(path, {
        method,
        body: JSON.stringify(payload),
      });

      if (editingTaskId) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTaskId ? result.data : task,
          ),
        );
        setMessage("Task updated.");
      } else {
        setTasks((currentTasks) => [result.data, ...currentTasks]);
        setMessage("Task created.");
      }

      closeTaskPopup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <h1>Care plan</h1>
        <p>Loading care plan...</p>
      </main>
    );
  }

  if (!carePlan) {
    return (
      <main>
        <h1>Care plan not found</h1>
        <p>{error || "This care plan could not be loaded."}</p>
        <Link to="/care-plans">Back to care plans</Link>
      </main>
    );
  }

  return (
    <main className="care-plan-details-page">
      <Link className="back-link" to="/care-plans">
        Back to care plans
      </Link>

      <section className="care-plan-detail-header">
        <div>
          <h1>{carePlan.title}</h1>
          <p>{carePlan.description || "No description added."}</p>
        </div>

        <span className={`status-pill status-${carePlan.status}`}>
          {carePlan.status}
        </span>
      </section>

      <section className="care-plan-detail-grid">
        <article>
          <span>Condition focus</span>
          <strong>{carePlan.conditionFocus || "Not set"}</strong>
        </article>


        <article>
          <span>Caregiver</span>

          <strong>
            {carePlan.caregiverAssignments?.length > 0
              ? carePlan.caregiverAssignments
                  .map((assignment) => assignment.caregiver?.name)
                  .filter(Boolean)
                  .join(", ")
              : "No caregiver assigned"}
          </strong>
        </article>

        <article>
          <span>Start date</span>
          <strong>{carePlan.startDate}</strong>
        </article>

        <article>
          <span>End date</span>
          <strong>{carePlan.endDate || "Ongoing"}</strong>
        </article>
      </section>

      <section className="task-list-header">
        <div>
          <h2>Tasks</h2>
          <p>Manage the tasks connected to this care plan.</p>
        </div>

        <button
          type="button"
          className="card-actions"
          onClick={openAddTaskPopup}
        >
          Add task
        </button>
      </section>

      {message ? <p className="profile-success">{message}</p> : null}
      {error && !isTaskPopupOpen ? <p className="auth-error">{error}</p> : null}

      <section className="task-list">
        {tasks.length === 0 ? <p>No tasks added yet.</p> : null}

        {tasks.map((task) => (
          <article className="task-card" key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.description || "No description added."}</p>
            </div>

            <dl>
              <div>
                <dt>Type</dt>
                <dd>{task.taskType}</dd>
              </div>

              <div>
                <dt>Scheduled</dt>
                <dd>
                  {task.scheduledTime
                    ? new Date(task.scheduledTime).toLocaleString()
                    : "Not set"}
                </dd>
              </div>

              <div>
                <dt>Frequency</dt>
                <dd>{task.frequency || "Not set"}</dd>
              </div>

              <div>
                <dt>Priority</dt>
                <dd>{task.priority}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{task.status}</dd>
              </div>
            </dl>

            <div className="card-actions">
              <button type="button" onClick={() => openEditTaskPopup(task)}>
                Edit
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {isTaskPopupOpen ? (
        <div className="modal-backdrop">
          <section className="task-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{editingTaskId ? "Edit task" : "Add task"}</h2>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeTaskPopup}
              >
                Close
              </button>
            </div>

            <form className="task-form" onSubmit={handleSubmit}>
              <label>
                Title
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  required
                  maxLength={150}
                />
              </label>

              <label>
                Task type
                <select
                  value={form.taskType}
                  onChange={(event) =>
                    updateField("taskType", event.target.value as TaskType)
                  }
                >
                  <option value="exercise">Exercise</option>
                  <option value="routine">Routine</option>
                  <option value="therapy">Therapy</option>
                  <option value="selfcare">Self care</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label>
                Scheduled time
                <input
                  type="datetime-local"
                  value={form.scheduledTime}
                  onChange={(event) =>
                    updateField("scheduledTime", event.target.value)
                  }
                />
              </label>

              <label>
                Frequency
                <input
                  value={form.frequency}
                  onChange={(event) =>
                    updateField("frequency", event.target.value)
                  }
                  maxLength={100}
                  placeholder="Daily, weekly, weekdays"
                />
              </label>

              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(event) =>
                    updateField("priority", event.target.value as TaskPriority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="med">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as TaskStatus)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="missed">Missed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </label>

              <label className="full-width">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                />
              </label>

              {error ? <p className="auth-error full-width">{error}</p> : null}

              <div className="form-actions full-width">
                <button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Saving..."
                    : editingTaskId
                      ? "Update task"
                      : "Add task"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeTaskPopup}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <MemberCaregiverNotes />
    </main>
  );
}
