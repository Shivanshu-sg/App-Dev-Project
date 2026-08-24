import { useEffect, useState } from 'react';
import type { DashboardSummary } from '@lifely/contracts';
import { api } from '../../lib/api';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>();
  useEffect(() => { api<{ data: DashboardSummary }>('/dashboard/summary').then(({ data }) => setSummary(data)).catch(() => setSummary({ medicationsDue: 0, appointmentsToday: 0, tasksRemaining: 0 })); }, []);
  return <main><h1>Today’s care</h1><p>Keep your day manageable, one task at a time.</p><section className="cards"><article>Medications due<strong>{summary?.medicationsDue ?? '—'}</strong></article><article>Appointments today<strong>{summary?.appointmentsToday ?? '—'}</strong></article><article>Tasks remaining<strong>{summary?.tasksRemaining ?? '—'}</strong></article></section></main>;
}
