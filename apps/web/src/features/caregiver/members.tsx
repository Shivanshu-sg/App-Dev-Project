import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { CaregiverNotes } from "./notes"

type Member = {
  id: string;
  email: string;
  role: "member";
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  disabilityType?: string | null;
  mobilityLevel?: string | null;
  activeCarePlans?: number;
  pendingTasks?: number;
  missedCheckIns?: number;
};

type MembersResponse = {
  data: Member[];
};

export function CareGiverMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMembers() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<MembersResponse>("/caregiver/members");
      setMembers(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load members");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName ?? ""} ${member.lastName ?? ""}`;
    const searchableText = `${fullName} ${member.email}`.toLowerCase();
    const matchesSearch = searchableText.includes(search.toLowerCase());

    const hasMissedCheckIns = (member.missedCheckIns ?? 0) > 0;
    const hasPendingTasks = (member.pendingTasks ?? 0) > 0;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "needsAttention" &&
        (hasMissedCheckIns || hasPendingTasks)) ||
      (statusFilter === "onTrack" && !hasMissedCheckIns && !hasPendingTasks);

    return matchesSearch && matchesStatus;
  });

  const uniqueFilteredMembers = filteredMembers.filter(
    (member, index, array) =>
      array.findIndex((item) => item.id === member.id) === index,
  );

  return (
    <main className="members-page">
      <section className="members-header">
        <div>
          <h1>Members</h1>
          <p>View assigned members and quickly spot who needs support.</p>
        </div>
      </section>

      <section className="members-toolbar">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
          />
        </label>

        <label>
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All members</option>
            <option value="needsAttention">Needs attention</option>
            <option value="onTrack">On track</option>
          </select>
        </label>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="members-list">
        {isLoading ? <p>Loading members...</p> : null}

        {!isLoading && filteredMembers.length === 0 ? (
          <p>No members found.</p>
        ) : null}

        {uniqueFilteredMembers.map((member) => {
          const name =
            `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
            member.email;

          const needsAttention =
            (member.missedCheckIns ?? 0) > 0 || (member.pendingTasks ?? 0) > 0;

          return (
            <article className="member-card" key={member.id}>
              <div>
                <h2>{name}</h2>
                <p>{member.email}</p>
              </div>

              <dl>
                <div>
                  <dt>Care plans</dt>
                  <dd>{member.activeCarePlans ?? 0}</dd>
                </div>

                <div>
                  <dt>Pending tasks</dt>
                  <dd>{member.pendingTasks ?? 0}</dd>
                </div>

                <div>
                  <dt>Missed check-ins</dt>
                  <dd>{member.missedCheckIns ?? 0}</dd>
                </div>

                <div>
                  <dt>Mobility</dt>
                  <dd>{member.mobilityLevel || "Not set"}</dd>
                </div>
              </dl>

              <div className="member-card-footer">
                <span
                  className={
                    needsAttention
                      ? "member-status needs-attention"
                      : "member-status on-track"
                  }
                >
                  {needsAttention ? "Needs attention" : "On track"}
                </span>

                <Link to={`/caregiver/members/${member.id}`}>View details</Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
