import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthenticatedUser, Role } from "@lifely/contracts";
import { api, registerUser } from "../../lib/api";

type AuthResponse = {
  data: {
    user: AuthenticatedUser;
    accessToken: string;
  };
};

const dashboardByRole: Record<Role, string> = {
  member: "/dashboard/member",
  caregiver: "/dashboard/caregiver",
  admin: "/dashboard/admin",
};

export function getDashboardPath(role: Role) {
  return dashboardByRole[role] ?? dashboardByRole.member;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await registerUser(email, password, role, name, occupation, phoneNumber);

      if (!user) {
        setError("Registration failed");
        return;
      }

      if (user.role === "member") {
        navigate("/profile", { replace: true });
      } else {
        navigate(getDashboardPath(user.role), { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>Create your Lifely AI account</h1>
        <p>Choose your role so we can open the right dashboard for you.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          {role === "caregiver" && (
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          {role === "caregiver" && (
            <label>
              Occupation
              <input
                type="text"
                value={occupation}
                onChange={(event) => setOccupation(event.target.value)}
                required
                autoComplete="occupation"
              />
            </label>
          )}

          {role === "caregiver" && (
            <label>
              Phone Number
              <input
                type="text"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
                autoComplete="telephone"
              />
            </label>
          )}

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
            />
          </label>

          <label>
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="member">Member</option>
              <option value="caregiver">Caregiver</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
