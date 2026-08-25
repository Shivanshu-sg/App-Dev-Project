import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { AuthenticatedUser } from "@lifely/contracts";

function getStoredUser(): AuthenticatedUser | null {
  const storedUser = localStorage.getItem("lifely_user");
  return storedUser ? (JSON.parse(storedUser) as AuthenticatedUser) : null;
}

export function App() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    localStorage.removeItem("lifely_access_token");
    localStorage.removeItem("lifely_user");
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header>
        <NavLink to="/">Lifely AI</NavLink>

        {!user ? (
          <nav className="navbar">
            <NavLink to="/register">Register</NavLink>
            <NavLink to="/login">Login</NavLink>
          </nav>
        ) : (
          <nav className="navbar">
            <div className="nav-links">
              {user.role === "member" && (
                <>
                  <NavLink to= "/profile">Profile</NavLink>
                  <NavLink to="/dashboard/member">Dashboard</NavLink>
                  <NavLink to="/care-plans">Care plans</NavLink>
                  <NavLink to="/check-ins">Check-in</NavLink>
                  <NavLink to="/goals">Goals</NavLink>
                  <NavLink to="/assistant">Assistant</NavLink>
                </>
              )}

              {user.role === "caregiver" && (
                <>
                  <NavLink to="/dashboard/caregiver">Caregiver Dashboard</NavLink>
                  <NavLink to="/care-plans">Care plans</NavLink>
                  <NavLink to="/check-ins">Check-ins</NavLink>
                  <NavLink to="/goals">Goals</NavLink>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <NavLink to="/dashboard/admin">Admin Dashboard</NavLink>
                  <NavLink to="/care-plans">Care plans</NavLink>
                  <NavLink to="/check-ins">Check-ins</NavLink>
                  <NavLink to="/goals">Goals</NavLink>
                  <NavLink to="/assistant">Assistant</NavLink>
                </>
              )}
            </div>

            <button type="button" className="logout-link" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        )}
      </header>

      <Outlet />
    </>
  );
}