import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";

type NoteCategory =
  | "general"
  | "health"
  | "medication"
  | "mood"
  | "task"
  | "emergency";

type CaregiverNote = {
  id: string;
  caregiverId: string;
  memberId: string;
  note: string;
  category: NoteCategory;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
};

type NotesResponse = {
  data: CaregiverNote[];
};

type NoteResponse = {
  data: CaregiverNote;
};

type NoteForm = {
  note: string;
  category: NoteCategory;
  isImportant: boolean;
};

const emptyNoteForm: NoteForm = {
  note: "",
  category: "general",
  isImportant: false,
};

export function CaregiverNotes({ memberId }: { memberId: string }) {
  const [notes, setNotes] = useState<CaregiverNote[]>([]);
  const [form, setForm] = useState<NoteForm>(emptyNoteForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadNotes() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<NotesResponse>(
        `/caregiver/notes/${memberId}/notes`,
      );
      setNotes(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notes");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [memberId]);

  function openAddPopup() {
    setForm(emptyNoteForm);
    setEditingId(null);
    setMessage("");
    setError("");
    setIsPopupOpen(true);
  }

  function openEditPopup(note: CaregiverNote) {
    setForm({
      note: note.note,
      category: note.category,
      isImportant: note.isImportant,
    });
    setEditingId(note.id);
    setMessage("");
    setError("");
    setIsPopupOpen(true);
  }

  function closePopup() {
    setForm(emptyNoteForm);
    setEditingId(null);
    setIsPopupOpen(false);
  }

  async function deleteNote(noteId: string) {
    const shouldDelete = window.confirm("Delete this note?");
    if (!shouldDelete) return;

    setMessage("");
    setError("");

    try {
      await api<{ data: { deleted: boolean } }>(
        `/caregiver/members/${memberId}/notes/${noteId}`,
        { method: "DELETE" },
      );

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== noteId),
      );

      setMessage("Note deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete note");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const path = editingId
        ? `/caregiver/notes/${memberId}/notes/${editingId}`
        : `/caregiver/notes/${memberId}/notes`;

      const method = editingId ? "PUT" : "POST";

      const result = await api<NoteResponse>(path, {
        method,
        body: JSON.stringify(form),
      });

      if (editingId) {
        setNotes((currentNotes) =>
          currentNotes.map((note) =>
            note.id === editingId ? result.data : note,
          ),
        );
        setMessage("Note updated.");
      } else {
        setNotes((currentNotes) => [result.data, ...currentNotes]);
        setMessage("Note added.");
      }

      closePopup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save note");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="caregiver-notes-section">
      <div className="caregiver-notes-header">
        <div>
          <h2>Caregiver notes</h2>
          <p>Keep private notes about support, concerns, and follow-ups.</p>
        </div>

        <button type="button" onClick={openAddPopup}>
          Add note
        </button>
      </div>

      {message ? <p className="profile-success">{message}</p> : null}
      {error && !isPopupOpen ? <p className="auth-error">{error}</p> : null}

      <div className="caregiver-notes-list">
        {isLoading ? <p>Loading notes...</p> : null}

        {!isLoading && notes.length === 0 ? <p>No notes yet.</p> : null}

        {notes.map((note) => (
          <article
            className={
              note.isImportant
                ? "caregiver-note-card important-note"
                : "caregiver-note-card"
            }
            key={note.id}
          >
            <div>
              <span className="note-category">{note.category}</span>
              {note.isImportant ? (
                <span className="important-label">Important</span>
              ) : null}
            </div>

            <p>{note.note}</p>

            <small>{new Date(note.createdAt).toLocaleString()}</small>

            <div className="card-actions">
              <button type="button" onClick={() => openEditPopup(note)}>
                Edit
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={() => deleteNote(note.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {isPopupOpen ? (
        <div className="modal-backdrop">
          <section className="task-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>{editingId ? "Edit note" : "Add note"}</h2>

              <button
                type="button"
                className="modal-close-button"
                onClick={closePopup}
              >
                Close
              </button>
            </div>

            <form className="caregiver-note-form" onSubmit={handleSubmit}>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      category: event.target.value as NoteCategory,
                    }))
                  }
                >
                  <option value="general">General</option>
                  <option value="health">Health</option>
                  <option value="medication">Medication</option>
                  <option value="mood">Mood</option>
                  <option value="task">Task</option>
                  <option value="emergency">Emergency</option>
                </select>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isImportant}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      isImportant: event.target.checked,
                    }))
                  }
                />
                Mark as important
              </label>

              <label className="full-width">
                Note
                <textarea
                  value={form.note}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      note: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              {error ? <p className="auth-error full-width">{error}</p> : null}

              <div className="form-actions full-width">
                <button type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Saving..."
                    : editingId
                      ? "Update note"
                      : "Add note"}
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
    </section>
  );
}