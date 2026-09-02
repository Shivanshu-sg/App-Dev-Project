import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

type NoteCategory =
  | "general"
  | "health"
  | "medication"
  | "mood"
  | "task"
  | "emergency";

type MemberCaregiverNote = {
  id: string;
  caregiverId: string;
  caregiverName: string;
  note: string;
  category: NoteCategory;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
};

type NotesResponse = {
  data: MemberCaregiverNote[];
};

type CategoryFilter = "all" | NoteCategory;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function MemberCaregiverNotes() {
  const [notes, setNotes] = useState<MemberCaregiverNote[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [importantOnly, setImportantOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotes() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<NotesResponse>("/member/caregiver-notes");
      setNotes(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notes");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesCategory =
        categoryFilter === "all" || note.category === categoryFilter;

      const matchesImportance = !importantOnly || note.isImportant;

      return matchesCategory && matchesImportance;
    });
  }, [notes, categoryFilter, importantOnly]);

  return (
    <main className="member-notes-page">
      <section className="member-notes-header">
        <div>
          <h1>Caregiver notes</h1>
          <p>View notes and guidance shared by your caregiver.</p>
        </div>
      </section>

      <section className="member-notes-toolbar">
        <label>
          Category
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CategoryFilter)
            }
          >
            <option value="all">All categories</option>
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
            checked={importantOnly}
            onChange={(event) => setImportantOnly(event.target.checked)}
          />
          Important only
        </label>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="member-notes-list">
        {isLoading ? <p>Loading notes...</p> : null}

        {!isLoading && filteredNotes.length === 0 ? (
          <p>No caregiver notes found.</p>
        ) : null}

        {filteredNotes.map((note) => (
          <article
            className={
              note.isImportant
                ? "member-note-card important-note"
                : "member-note-card"
            }
            key={note.id}
          >
            <div className="member-note-card-header">
              <div>
                <span className="note-category">{note.category}</span>
                {note.isImportant ? (
                  <span className="important-label">Important</span>
                ) : null}
              </div>

              <small>{formatDateTime(note.createdAt)}</small>
            </div>

            <p>{note.note}</p>

            <footer>
              From <strong>{note.caregiverName}</strong>
            </footer>
          </article>
        ))}
      </section>
    </main>
  );
}