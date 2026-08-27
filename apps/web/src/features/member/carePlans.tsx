import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

type CarePlanStatus = "active" | "paused" | "completed";

type CarePlan = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  conditionFocus: string | null;
  startDate: string;
  endDate: string | null;
  status: CarePlanStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
};

type CarePlansResponse = {
  data: CarePlan[];
};

type CarePlanResponse = {
  data: CarePlan;
};

type CarePlanForm = {
  title: string;
  description: string;
  conditionFocus: string;
  startDate: string;
  endDate: string;
  status: CarePlanStatus;
};

const emptyCarePlan: CarePlanForm = {
  title: "",
  description: "",
  conditionFocus: "",
  startDate: "",
  endDate: "",
  status: "active",
};

export function CarePlans() {
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [form, setForm] = useState<CarePlanForm>(emptyCarePlan);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCarePlans() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<CarePlansResponse>("/member/care-plans");
      setCarePlans(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load care plans");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCarePlans();
  }, []);

  function updateField<K extends keyof CarePlanForm>(
    field: K,
    value: CarePlanForm[K],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function openAddPopup() {
    setForm(emptyCarePlan);
    setEditingId(null);
    setMessage("");
    setError("");
    setIsPopupOpen(true);
  }

  function openEditPopup(carePlan: CarePlan) {
    setEditingId(carePlan.id);
    setForm({
      title: carePlan.title,
      description: carePlan.description ?? "",
      conditionFocus: carePlan.conditionFocus ?? "",
      startDate: carePlan.startDate,
      endDate: carePlan.endDate ?? "",
      status: carePlan.status,
    });
    setMessage("");
    setError("");
    setIsPopupOpen(true);
  }

  function closePopup() {
    setForm(emptyCarePlan);
    setEditingId(null);
    setIsPopupOpen(false);
  }

  async function deleteCarePlan(id: string) {
    const shouldDelete = window.confirm("Delete this care plan?");
    if (!shouldDelete) return;

    setError("");
    setMessage("");

    try {
      await api<{ data: { deleted: boolean } }>(`/member/care-plans/${id}`, {
        method: "DELETE",
      });

      setCarePlans((currentPlans) =>
        currentPlans.filter((carePlan) => carePlan.id !== id),
      );

      if (editingId === id) closePopup();

      setMessage("Care plan deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete care plan");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        description: form.description || null,
        conditionFocus: form.conditionFocus || null,
        endDate: form.endDate || null,
      };

      const path = editingId
        ? `/member/care-plans/${editingId}`
        : "/member/care-plans";

      const method = editingId ? "PUT" : "POST";

      const result = await api<CarePlanResponse>(path, {
        method,
        body: JSON.stringify(payload),
      });

      if (editingId) {
        setCarePlans((currentPlans) =>
          currentPlans.map((carePlan) =>
            carePlan.id === editingId ? result.data : carePlan,
          ),
        );
        setMessage("Care plan updated.");
      } else {
        setCarePlans((currentPlans) => [result.data, ...currentPlans]);
        setMessage("Care plan created.");
      }

      closePopup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save care plan");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="care-plans-page">
      <section className="care-plans-header">
        <div>
          <h1>Care plans</h1>
          <p>Create and manage care plans for your health goals.</p>
        </div>

        <button type="button" onClick={openAddPopup}>
          Add care plan
        </button>
      </section>

      {message ? <p className="profile-success">{message}</p> : null}
      {error && !isPopupOpen ? <p className="auth-error">{error}</p> : null}

      <section className="care-plan-list">
        <h2>Existing care plans</h2>

        {isLoading ? <p>Loading care plans...</p> : null}

        {!isLoading && carePlans.length === 0 ? (
          <p>No care plans yet.</p>
        ) : null}

        {carePlans.map((carePlan) => (
          <article className="care-plan-card" key={carePlan.id}>
            <div>
              <h3>{carePlan.title}</h3>
              <p>{carePlan.description || "No description added."}</p>
            </div>

            <dl>
              <div>
                <dt>Condition</dt>
                <dd>{carePlan.conditionFocus || "Not set"}</dd>
              </div>

              <div>
                <dt>Start</dt>
                <dd>{carePlan.startDate}</dd>
              </div>

              <div>
                <dt>End</dt>
                <dd>{carePlan.endDate || "Ongoing"}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{carePlan.status}</dd>
              </div>
            </dl>

            <div className="card-actions">
              <Link to={`/care-plans/${carePlan.id}`}>Tasks</Link>

              <button type="button" onClick={() => openEditPopup(carePlan)}>
                Edit
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={() => deleteCarePlan(carePlan.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {isPopupOpen ? (
        <div className="modal-backdrop">
          <section className="task-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{editingId ? "Edit care plan" : "Add care plan"}</h2>

              <button
                type="button"
                className="modal-close-button"
                onClick={closePopup}
              >
                Close
              </button>
            </div>

            <form className="care-plan-form" onSubmit={handleSubmit}>
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
                Condition focus
                <input
                  value={form.conditionFocus}
                  onChange={(event) =>
                    updateField("conditionFocus", event.target.value)
                  }
                  maxLength={150}
                />
              </label>

              <label>
                Start date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField("startDate", event.target.value)
                  }
                  required
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) =>
                    updateField("endDate", event.target.value)
                  }
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as CarePlanStatus)
                  }
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
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
                    : editingId
                      ? "Update care plan"
                      : "Create care plan"}
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