import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

type CheckInStatus = "pending" | "done" | "missed" | "skipped";

type CaregiverCheckIn = {
  id: string;
  userId: string;
  memberName: string;
  carePlanId: string;
  carePlanTitle: string;
  taskId: string;
  taskTitle: string;
  checkInDate: string;
  status: CheckInStatus;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CaregiverCheckInsResponse = {
  data: CaregiverCheckIn[];
};

type StatusFilter = "all" | CheckInStatus;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string | null) {
  if (!value) return "Not completed";
  return new Date(value).toLocaleString();
}

export function CaregiverCheckIns() {
  const [checkIns, setCheckIns] = useState<CaregiverCheckIn[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCheckIns() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<CaregiverCheckInsResponse>(
        "/caregiver/check-ins",
      );
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

  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((checkIn) => {
      const text = `${checkIn.memberName} ${checkIn.carePlanTitle} ${checkIn.taskTitle}`
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || checkIn.status === statusFilter;

      const matchesDate =
        !dateFilter || checkIn.checkInDate.slice(0, 10) === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [checkIns, search, statusFilter, dateFilter]);

  return (
    <main className="caregiver-checkins-page">
      <section className="caregiver-checkins-header">
        <div>
          <h1>Check-ins</h1>
          <p>Review daily task updates across all members.</p>
        </div>
      </section>

      <section className="caregiver-checkins-toolbar">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search member, care plan, or task"
          />
        </label>

        <label>
          Status
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="missed">Missed</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </label>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="caregiver-checkin-list">
        {isLoading ? <p>Loading check-ins...</p> : null}

        {!isLoading && filteredCheckIns.length === 0 ? (
          <p>No check-ins found.</p>
        ) : null}

        {filteredCheckIns.map((checkIn) => (
          <article className="caregiver-checkin-card" key={checkIn.id}>
            <div>
              <h2>{checkIn.taskTitle}</h2>
              <p>{checkIn.notes || "No notes added."}</p>
            </div>

            <dl>
              <div>
                <dt>Member</dt>
                <dd>
                  <Link to={`/caregiver/members/${checkIn.userId}`}>
                    {checkIn.memberName}
                  </Link>
                </dd>
              </div>

              <div>
                <dt>Care plan</dt>
                <dd>{checkIn.carePlanTitle}</dd>
              </div>

              <div>
                <dt>Date</dt>
                <dd>{formatDate(checkIn.checkInDate)}</dd>
              </div>

              <div>
                <dt>Completed at</dt>
                <dd>{formatDateTime(checkIn.completedAt)}</dd>
              </div>
            </dl>

            <div className="caregiver-checkin-meta">
              <span className={`task-status task-status-${checkIn.status}`}>
                {checkIn.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}