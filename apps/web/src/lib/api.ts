import { AuthenticatedUser, Role } from "@lifely/contracts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

type AuthResponse = {
  data: {
    user: AuthenticatedUser;
    accessToken: string;
  };
};

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("lifely_access_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => null))?.error ?? "Request failed",
    );
  return response.json() as Promise<T>;
}

export async function registerUser(email: string, password: string, role: Role, name: string, occupation: string, mobileNumber: string): Promise<AuthenticatedUser> {
  const result = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role, name, occupation, mobileNumber }),
  });

  localStorage.setItem("lifely_access_token", result.data.accessToken);
  localStorage.setItem("lifely_user", JSON.stringify(result.data.user));
  return result.data.user;
}
