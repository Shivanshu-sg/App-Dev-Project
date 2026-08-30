import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";

type MemberDetails = {
  id: string;
  email: string;
  role: "member";
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  disabilityType: string | null;
  mobilityLevel: string | null;
  wheelchairUser: boolean | null;
  fatigueTrigger: string | null;
  medicationRoutine: string | null;
  workStudySchedule: string | null;
  accessibilityNeeds: string | null;
  activeCarePlans: number;
  pendingTasks: number;
  missedCheckIns: number;
  carePlans: {
    id: string;
    title: string;
    description: string | null;
    conditionFocus: string | null;
    startDate: string;
    endDate: string | null;
    status: "active" | "paused" | "completed";
  }[];
  recentCheckIns: {
    id: string;
    checkInDate: string;
    status: "done" | "missed" | "skipped";
    notes: string | null;
    task?: {
      id: string;
      title: string;
    };
  }[];
};

type MemberDetailsResponse = {
  data: MemberDetails;
};

export function MemberDetailsPage() {
  const { memberId } = useParams();
  const [member, setMember] = useState<MemberDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMemberDetails() {
      if (!memberId) return;

      setIsLoading(true);
      setError("");

      try {
        const result = await api<MemberDetailsResponse>(
          `/caregiver/members/${memberId}`,
        );

        setMember(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load member details",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMemberDetails();
  }, [memberId]);

  if (isLoading) {
    return (
      <main>
        <h1>Member details</h1>
        <p>Loading member details...</p>
      </main>
    );
  }

  if (!member) {
    return (
      <main>
        <h1>Member not found</h1>
        <p>{error || "This member could not be loaded."}</p>
        <Link to="/caregiver/members">Back to members</Link>
      </main>
    );
  }

  const fullName =
    `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
    member.email;

  return (
    <main className="member-details-page">
      <Link className="back-link" to="/caregiver/members">
        Back to members
      </Link>

      <section className="member-details-header">
        <div>
          <h1>{fullName}</h1>
          <p>{member.email}</p>
        </div>

        <span
          className={
            member.missedCheckIns > 0 || member.pendingTasks > 0
              ? "member-status needs-attention"
              : "member-status on-track"
          }
        >
          {member.missedCheckIns > 0 || member.pendingTasks > 0
            ? "Needs attention"
            : "On track"}
        </span>
      </section>

      <section className="member-stats-grid">
        <article>
          <span>Active care plans</span>
          <strong>{member.activeCarePlans}</strong>
        </article>

        <article>
          <span>Pending tasks</span>
          <strong>{member.pendingTasks}</strong>
        </article>

        <article>
          <span>Missed check-ins</span>
          <strong>{member.missedCheckIns}</strong>
        </article>
      </section>

      <section className="member-info-grid">
        <article>
          <h2>Personal information</h2>

          <dl>
            <div>
              <dt>Phone</dt>
              <dd>{member.phoneNumber || "Not set"}</dd>
            </div>

            <div>
              <dt>Date of birth</dt>
              <dd>{member.dateOfBirth || "Not set"}</dd>
            </div>

            <div>
              <dt>Gender</dt>
              <dd>{member.gender || "Not set"}</dd>
            </div>

            <div>
              <dt>Address</dt>
              <dd>
                {[member.address, member.city, member.state, member.postalCode, member.country]
                  .filter(Boolean)
                  .join(", ") || "Not set"}
              </dd>
            </div>
          </dl>
        </article>

        <article>
          <h2>Care needs</h2>

          <dl>
            <div>
              <dt>Disability type</dt>
              <dd>{member.disabilityType || "Not set"}</dd>
            </div>

            <div>
              <dt>Mobility level</dt>
              <dd>{member.mobilityLevel || "Not set"}</dd>
            </div>

            <div>
              <dt>Wheelchair user</dt>
              <dd>{member.wheelchairUser ? "Yes" : "No"}</dd>
            </div>

            <div>
              <dt>Fatigue trigger</dt>
              <dd>{member.fatigueTrigger || "Not set"}</dd>
            </div>

            <div>
              <dt>Medication routine</dt>
              <dd>{member.medicationRoutine || "Not set"}</dd>
            </div>

            <div>
              <dt>Work/study schedule</dt>
              <dd>{member.workStudySchedule || "Not set"}</dd>
            </div>

            <div>
              <dt>Accessibility needs</dt>
              <dd>{member.accessibilityNeeds || "Not set"}</dd>
            </div>
          </dl>
        </article>

        <article>
          <h2>Emergency contact</h2>

          <dl>
            <div>
              <dt>Name</dt>
              <dd>{member.emergencyContactName || "Not set"}</dd>
            </div>

            <div>
              <dt>Phone</dt>
              <dd>{member.emergencyContactPhone || "Not set"}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="member-section">
        <h2>Care plans</h2>

        {member.carePlans.length === 0 ? <p>No care plans yet.</p> : null}

        <div className="member-care-plan-list">
          {member.carePlans.map((carePlan) => (
            <article className="member-care-plan-card" key={carePlan.id}>
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
            </article>
          ))}
        </div>
      </section>

      <section className="member-section">
        <h2>Recent check-ins</h2>

        {member.recentCheckIns.length === 0 ? (
          <p>No check-ins yet.</p>
        ) : null}

        <div className="member-check-in-list">
          {member.recentCheckIns.map((checkIn) => (
            <article className="member-check-in-card" key={checkIn.id}>
              <div>
                <h3>{checkIn.task?.title ?? "Care task"}</h3>
                <p>{checkIn.notes || "No notes added."}</p>
              </div>

              <dl>
                <div>
                  <dt>Date</dt>
                  <dd>{checkIn.checkInDate}</dd>
                </div>

                <div>
                  <dt>Status</dt>
                  <dd>{checkIn.status}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

