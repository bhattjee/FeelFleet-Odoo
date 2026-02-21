/** Maps backend role enum to display label for sidebar */
export function formatRole(role: string | undefined): string {
  if (!role) return 'User';
  const map: Record<string, string> = {
    MANAGER: 'Manager',
    DISPATCHER: 'Dispatcher',
    SAFETY_OFFICER: 'Safety Officer',
    FINANCIAL_ANALYST: 'Financial Analyst',
  };
  return map[role] || role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
