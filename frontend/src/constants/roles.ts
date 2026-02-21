/**
 * Role values must match backend UserRole enum (API and JWT).
 * Used for RBAC: route access and API permissions align with backend requireRole().
 */
export const ROLES = {
  MANAGER: 'MANAGER',
  DISPATCHER: 'DISPATCHER',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
  FINANCIAL_ANALYST: 'FINANCIAL_ANALYST',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Which roles can access each route. Aligned with backend:
 * - vehicles: getAll is auth-only; create/update/retire = MANAGER; available = MANAGER, DISPATCHER
 * - trips: create/updateStatus = MANAGER, DISPATCHER
 * - drivers: getAvailable = MANAGER, DISPATCHER; create/update = MANAGER, SAFETY_OFFICER
 * - maintenance: getAll/create = MANAGER, SAFETY_OFFICER; complete = MANAGER
 * - expenses: getAll/create = MANAGER, FINANCIAL_ANALYST; fuel = MANAGER, DISPATCHER
 * - analytics: fuel-efficiency/cost-breakdown = MANAGER, FINANCIAL_ANALYST
 */
export const ROUTE_ROLES: Record<string, Role[]> = {
  dashboard: [ROLES.MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER, ROLES.FINANCIAL_ANALYST],
  vehicles: [ROLES.MANAGER, ROLES.DISPATCHER],
  trips: [ROLES.MANAGER, ROLES.DISPATCHER],
  maintenance: [ROLES.MANAGER, ROLES.SAFETY_OFFICER],
  expenses: [ROLES.MANAGER, ROLES.FINANCIAL_ANALYST, ROLES.DISPATCHER],
  drivers: [ROLES.MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER],
  analytics: [ROLES.MANAGER, ROLES.FINANCIAL_ANALYST],
};

/** Path to route key for RBAC (must match ROUTES in constants/routes.ts) */
export const PATH_TO_ROUTE_KEY: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/vehicles': 'vehicles',
  '/trips': 'trips',
  '/maintenance': 'maintenance',
  '/expenses': 'expenses',
  '/drivers': 'drivers',
  '/analytics': 'analytics',
};

/** Returns whether the given role can access the route (by path). */
export function canAccessRoute(path: string, role: string): boolean {
  const key = PATH_TO_ROUTE_KEY[path];
  if (!key) return false;
  const allowed = ROUTE_ROLES[key];
  return allowed ? allowed.includes(role as Role) : false;
}
