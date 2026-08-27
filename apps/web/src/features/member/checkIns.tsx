import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";

type CheckInStatus = "done" | "missed" | "skipped" | "pending";

type CheckIn = {
  id: string;
  userId: string;
  carePlanId: string;
  carePlanTitle: string;
  taskId: string;
  checkInDate: string;
  status: CheckInStatus;
  notes: string | null;
  carePlan?: {
    id: string;
    title: string;
  };
  task?: {
    id: string;
    title: string;
  };
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CheckInsResponse = {
  data: CheckIn[];
};

type CheckInResponse = {
  data: CheckIn;
};

type CheckInForm = {
  carePlanId: string;
  taskId: string;
  checkInDate: string;
  status: CheckInStatus;
  notes: string;
  carePlanTitle: string;
};

const emptyCheckInForm: CheckInForm = {
  carePlanId: "",
  taskId: "",
  checkInDate: new Date().toISOString().slice(0, 10),
  status: "done",
  notes: "",
  carePlanTitle: "",
};

export function CheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [form, setForm] = useState<CheckInForm>(emptyCheckInForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCheckIns() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<CheckInsResponse>("/member/check-ins");
      console.log("Loaded check-ins:", result.data);
      setCheckIns(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load check-ins");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCheckIns();
  }, []);

  function updateField<K extends keyof CheckInForm>(
    field: K,
    value: CheckInForm[K],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function openAddPopup() {
    setForm(emptyCheckInForm);
    setEditingId(null);
    setMessage("");
    setError("");
    setIsPopupOpen(true);
  }

  function openEditPopup(checkIn: CheckIn) {
    setEditingId(checkIn.id);
    setForm({
      carePlanId: checkIn.carePlanId,
      taskId: checkIn.taskId,
      carePlanTitle: checkIn.carePlanTitle,
      checkInDate: checkIn.checkInDate.slice(0, 10),
      status: checkIn.status,
      notes: checkIn.notes ?? "",
    });
    setMessage("");
    setError("");
    setIsPopupOpen(true);
  }

  function closePopup() {
    setForm(emptyCheckInForm);
    setEditingId(null);
    setIsPopupOpen(false);
  }

  async function deleteCheckIn(id: string) {
    const shouldDelete = window.confirm("Delete this check-in?");
    if (!shouldDelete) return;

    setError("");
    setMessage("");

    try {
      await api<{ data: { deleted: boolean } }>(`/member/check-ins/${id}`, {
        method: "DELETE",
      });

      setCheckIns((currentCheckIns) =>
        currentCheckIns.filter((checkIn) => checkIn.id !== id),
      );

      setMessage("Check-in deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete check-in");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = editingId
        ? {
            status: form.status,
            notes: form.notes || null,
          }
        : {
            carePlanId: form.carePlanId,
            taskId: form.taskId,
            checkInDate: form.checkInDate,
            status: form.status,
            notes: form.notes || null,
          };

      const path = editingId
        ? `/member/check-ins/${editingId}`
        : "/member/check-ins";

      const method = editingId ? "PUT" : "POST";

      const result = await api<CheckInResponse>(path, {
        method,
        body: JSON.stringify(payload),
      });

      if (editingId) {
        setCheckIns((currentCheckIns) =>
          currentCheckIns.map((checkIn) =>
            checkIn.id === editingId ? result.data : checkIn,
          ),
        );
        setMessage("Check-in updated.");
      } else {
        setCheckIns((currentCheckIns) => [result.data, ...currentCheckIns]);
        setMessage("Check-in created.");
      }

      closePopup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save check-in");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="check-ins-page">
      <section className="check-ins-header">
        <div>
          <h1>Daily check-ins</h1>
          <p>Track completed, missed, and skipped care plan tasks.</p>
        </div>

        <button type="button" onClick={openAddPopup}>
          Add check-in
        </button>
      </section>

      {message ? <p className="profile-success">{message}</p> : null}
      {error && !isPopupOpen ? <p className="auth-error">{error}</p> : null}

      <section className="check-ins-list">
        <h2>Check-in history</h2>

        {isLoading ? <p>Loading check-ins...</p> : null}

        {!isLoading && checkIns.length === 0 ? (
          <p>No check-ins yet.</p>
        ) : null}

        {checkIns.map((checkIn) => (
          <article className="check-in-card" key={checkIn.id}>
            <div>
              <h3>{checkIn.status}</h3>
              <p>{checkIn.notes || "No notes added."}</p>
            </div>

            <dl>
              <div>
                <dt>Date</dt>
                <dd>{checkIn.checkInDate.slice(0, 10)}</dd>
              </div>

              <div>
                <dt>Care plan</dt>
                <dd>{checkIn.carePlan?.title || "N/A"}</dd>
              </div>

              <div>
                <dt>Task</dt>
                <dd>{checkIn.task?.title || "N/A"}</dd>
              </div>

              <div>
                <dt>Completed</dt>
                <dd>
                  {checkIn.completedAt
                    ? new Date(checkIn.completedAt).toLocaleString()
                    : "Not completed"}
                </dd>
              </div>
            </dl>

            <div className="card-actions">
              <button type="button" onClick={() => openEditPopup(checkIn)}>
                Edit
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={() => deleteCheckIn(checkIn.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {isPopupOpen ? (
        <div className="modal-backdrop">
          <section className="check-in-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{editingId ? "Edit check-in" : "Add check-in"}</h2>

              <button
                type="button"
                className="modal-close-button"
                onClick={closePopup}
              >
                Close
              </button>
            </div>

            <form className="check-in-form" onSubmit={handleSubmit}>
              {!editingId ? (
                <>
                  <label>
                    Care plan ID
                    <input
                      value={form.carePlanId}
                      onChange={(event) =>
                        updateField("carePlanId", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Task ID
                    <input
                      value={form.taskId}
                      onChange={(event) =>
                        updateField("taskId", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Check-in date
                    <input
                      type="date"
                      value={form.checkInDate}
                      onChange={(event) =>
                        updateField("checkInDate", event.target.value)
                      }
                      required
                    />
                  </label>
                </>
              ) : null}

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as CheckInStatus)
                  }
                >
                  <option value="done">Done</option>
                  <option value="missed">Missed</option>
                  <option value="skipped">Skipped</option>
                  <option value="pending">Pending</option>
                </select>
              </label>

              <label className="full-width">
                Notes
                <textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </label>

              {error ? <p className="auth-error full-width">{error}</p> : null}

              <div className="form-actions full-width">
                <button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Saving..."
                    : editingId
                      ? "Update check-in"
                      : "Create check-in"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closePopup}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}