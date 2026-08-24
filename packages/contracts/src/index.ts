export const ROLES = ['member', 'caregiver', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T> { data: T; }
export interface DashboardSummary {
  medicationsDue: number;
  appointmentsToday: number;
  tasksRemaining: number;
}
