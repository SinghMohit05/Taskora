export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(dueDate?: string | Date | null, status?: string): boolean {
  if (!dueDate || status === 'Completed' || status === 'COMPLETED') return false;
  const d = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d < now;
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
