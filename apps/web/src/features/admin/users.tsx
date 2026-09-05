import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

type UserRole = "member" | "caregiver" | "admin";

type AdminUser = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  caregiverName: string | null;
  caregiverPhoneNumber: string | null;
};

type UsersResponse = {
  data: AdminUser[];
};

type UserResponse = {
  data: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
  };
};

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | "active" | "inactive";

function getUserName(user: AdminUser) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || `${user.caregiverName ?? ""}`.trim() || user.email;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadUsers() {
    setIsLoading(true);
    setError("");

    try {
      const result = await api<UsersResponse>("/admin/users");
      setUsers(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleUserStatus(user: AdminUser) {
    setUpdatingId(user.id);
    setError("");

    try {
      const result = await api<UserResponse>(`/admin/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? { ...currentUser, isActive: result.data.isActive }
            : currentUser,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update user");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchableText = `${user.email} ${getUserName(user)} ${user.phoneNumber ?? ""}`
        .toLowerCase();

      const matchesSearch = searchableText.includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <main className="admin-users-page">
      <section className="admin-users-header">
        <div>
          <h1>Users</h1>
          <p>Manage members, caregivers, and admins.</p>
        </div>
      </section>

      <section className="admin-users-toolbar">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or phone"
          />
        </label>

        <label>
          Role
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
          >
            <option value="all">All roles</option>
            <option value="member">Members</option>
            <option value="caregiver">Caregivers</option>
            <option value="admin">Admins</option>
          </select>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="admin-users-list">
        {isLoading ? <p>Loading users...</p> : null}

        {!isLoading && filteredUsers.length === 0 ? <p>No users found.</p> : null}

        {filteredUsers.map((user) => (
          <article className="admin-user-card" key={user.id}>
            <div>
              <h2>{getUserName(user)}</h2>
              <p>{user.email}</p>
            </div>

            <dl>
              <div>
                <dt>Role</dt>
                <dd>{user.role}</dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{user.isActive ? "Active" : "Inactive"}</dd>
              </div>

              <div>
                <dt>Phone</dt>
                <dd>{user.phoneNumber || user.caregiverPhoneNumber || "Not set"}</dd>
              </div>

              <div>
                <dt>Joined</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
            </dl>

            <div className="admin-user-actions">
              <span
                className={
                  user.isActive ? "admin-status active" : "admin-status inactive"
                }
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>

              <button
                type="button"
                onClick={() => toggleUserStatus(user)}
                disabled={updatingId === user.id}
              >
                {updatingId === user.id
                  ? "Updating..."
                  : user.isActive
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}