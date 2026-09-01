import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

type DashboardSummary = {
  medicationsDue: number;
  appointmentsToday: number;
  tasksRemaining: number;
};

type CareTask = {
  id: string;
  title: string;
  scheduledTime: string | null;
  status: "pending" | "done" | "missed" | "skipped";
  carePlan?: {
    id: string;
    title: string;
  };
};

type CheckIn = {
  id: string;
  taskId: string;
  checkInDate: string;
  status: "done" | "missed" | "skipped";
  notes: string | null;
  task?: {
    id: string;
    title: string;
    scheduledTime: string | null;
  };
  carePlan?: {
    id: string;
    title: string;
  };
};

type User = {
  id: string;
  email: string;
  role: string;
};

type SummaryResponse = {
  data: DashboardSummary;
};

type CheckInsResponse = {
  data: CheckIn[];
};

type MemberProfile = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phoneNumber: string | null;
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
};

type MemberProfileResponse = {
  data: MemberProfile;
};

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem("lifely_user");
  return storedUser ? (JSON.parse(storedUser) as User) : null;
}

function formatDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string | null) {
  if (!value) return "No time";

  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MemberDashboard() {
  const [user] = useState(() => getStoredUser());
  const [summary, setSummary] = useState<DashboardSummary>({
    medicationsDue: 0,
    appointmentsToday: 0,
    tasksRemaining: 0,
  });
  const [todayTasks, setTodayTasks] = useState<CareTask[]>([]);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [mood, setMood] = useState("Good");
  const [energy, setEnergy] = useState("Medium");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);

      try {
        const [summaryResult, checkInsResult, memberProfile] = await Promise.all([
          api<SummaryResponse>("/dashboard/summary"),
          api<CheckInsResponse>(
            `/member/check-ins/date/${new Date().toISOString().slice(0, 10)}`,
          ),
          api<MemberProfileResponse >("/member/profile"),
        ]);

        setSummary(summaryResult.data);

        setTodayTasks(
          checkInsResult.data.map((checkIn) => ({
            id: checkIn.taskId,
            title: checkIn.task?.title ?? "Care task",
            scheduledTime: checkIn.task?.scheduledTime ?? null,
            status: checkIn.status,
            carePlan: checkIn.carePlan,
          })),
        );
        setMemberProfile(memberProfile.data);
        console.log("Member profile:", memberProfile.data);
      } catch {
        setTodayTasks([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const completedTasks = todayTasks.filter(
    (task) => task.status === "done",
  ).length;

  return (
    <main className="member-dashboard">
      <section className="dashboard-topbar">
        <div>
          <h1>Lifely AI</h1>
          <p>Hello, {memberProfile?.firstName}</p>
        </div>

        <div className="dashboard-actions">
          <Link to="/profile">Profile</Link>
          {/* <Link to="/settings">Settings</Link> */}
          <span>{formatDate()}</span>
        </div>
      </section>

      <section className="dashboard-summary">
        <p>
          Today Summary: Meds Due <strong>{summary.medicationsDue}</strong>
          <span>|</span>
          Appointments <strong>{summary.appointmentsToday}</strong>
          <span>|</span>
          Tasks <strong>{summary.tasksRemaining || todayTasks.length}</strong>
        </p>

        <div className="wellbeing-row">
          <label>
            Mood
            <select
              value={mood}
              onChange={(event) => setMood(event.target.value)}
            >
              <option>Good</option>
              <option>Okay</option>
              <option>Low</option>
            </select>
          </label>

          <label>
            Energy
            <select
              value={energy}
              onChange={(event) => setEnergy(event.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
        </div>
      </section>

      <section className="today-care-plan">
        <h2>Today's Tasks</h2>

        {isLoading ? <p>Loading today's care plan...</p> : null}

        {!isLoading && todayTasks.length === 0 ? (
          <p>No tasks due today.</p>
        ) : null}

        {todayTasks.map((task) => (
          <div className="today-task" key={task.id}>
            <span>[{task.status === "done" ? "x" : " "}]</span>
            <Link to={"/check-ins"}>{task.title}</Link>
            <span>{formatTime(task.scheduledTime)}</span>
          </div>
        ))}

        <p className="progress-line">
          Progress: {completedTasks}/{todayTasks.length} completed
        </p>
      </section>

      {/* <section className="dashboard-tabs">
        <Link to="/medications">Medications</Link>
        <Link to="/appointments">Appointments</Link>
        <Link to="/check-ins">Check-in</Link>
        <Link to="/goals">Goals</Link>
        <Link to="/assistant">AI</Link>
      </section> */}
    </main>
  );
}
