'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/app-shell';
import { useDebounce } from '@/hooks/use-debounce';
import TaskModal from '@/components/modals/task-modal';
import ConfirmModal from '@/components/modals/confirm-modal';
import { tasksApi, projectsApi } from '@/lib/api';
import type { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from '@/lib/api';
import {
  CircularDonutGraph,
  MultiSegmentDonutChart,
} from '@/components/charts/circular-graphs';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        styles[status] || styles['Pending']
      }`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    Low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        styles[priority] || styles['Medium']
      }`}
    >
      {priority}
    </span>
  );
}

const STATUS_FILTERS: (TaskStatus | 'all')[] = ['all', 'Pending', 'In Progress', 'Completed'];
const PRIORITY_FILTERS: (TaskPriority | 'all')[] = ['all', 'High', 'Medium', 'Low'];

import { Suspense } from 'react';

function TasksContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  useEffect(() => {
    const q = searchParams?.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  // Debounce the search input to avoid spamming the API and causing UI lag on every keystroke.
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', debouncedSearch, statusFilter, priorityFilter, page],
    queryFn: () =>
      tasksApi.list({
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        page,
        limit: 15,
      }),
  });

  const tasks = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 15, total: 0, totalPages: 1 };

  // Memoize these calculations so we don't drop frames recalculating charts
  // when unrelated state changes (like toggling a modal).
  const metrics = useMemo(() => {
    const totalCount = meta.total || tasks.length;
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
    const pendingCount = tasks.filter((t) => t.status === 'Pending').length;

    const highPriority = tasks.filter((t) => t.priority === 'High').length;
    const medPriority = tasks.filter((t) => t.priority === 'Medium').length;
    const lowPriority = tasks.filter((t) => t.priority === 'Low').length;

    const prioritySegments = [
      { label: 'High', value: highPriority, color: '#EF4444', percentage: tasks.length ? Math.round((highPriority / tasks.length) * 100) : 35 },
      { label: 'Medium', value: medPriority, color: '#F59E0B', percentage: tasks.length ? Math.round((medPriority / tasks.length) * 100) : 45 },
      { label: 'Low', value: lowPriority, color: '#3B82F6', percentage: tasks.length ? Math.round((lowPriority / tasks.length) * 100) : 20 },
    ];

    return { totalCount, completedCount, inProgressCount, pendingCount, highPriority, medPriority, lowPriority, prioritySegments };
  }, [tasks, meta.total]);

  const { completedCount, inProgressCount, pendingCount, highPriority, medPriority, lowPriority, prioritySegments } = metrics;

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => tasksApi.update(id, data),
    
    // Optimistic UI update: instantly apply the task status toggle locally
    // before the server responds to make the interaction feel immediate.
    onMutate: async ({ id, data }) => {
      const queryKey = ['tasks', debouncedSearch, statusFilter, priorityFilter, page];
      await queryClient.cancelQueries({ queryKey });
      const previousTasks = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((t: any) => (t.id === id ? { ...t, ...data } : t)),
        };
      });
      return { previousTasks, queryKey };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(context.queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteTarget(null);
    },
  });

  const handleOpenCreate = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await updateMutation.mutateAsync({ id: task.id, data: { status: newStatus } });
  };

  return (
    <AppShell>
      <div className="max-w-[1580px] mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Workload</span>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight mt-0.5">
              Tasks
            </h1>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Top Analytics Cards with Circular Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Circular Donut 1: Completion */}
          <div className="bg-[#121622] rounded-2xl p-5 border border-white/[0.06] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completion Velocity</p>
              <p className="text-2xl font-display font-bold text-white mt-1">
                {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {completedCount} of {tasks.length} tasks completed
              </p>
            </div>
            <CircularDonutGraph
              percentage={tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}
              label="Delivery"
              sublabel="Active"
              size={64}
              strokeWidth={8}
            />
          </div>

          {/* Circular Donut 2: In-Progress throughput */}
          <div className="bg-[#121622] rounded-2xl p-5 border border-white/[0.06] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Pipeline</p>
              <p className="text-2xl font-display font-bold text-white mt-1">{inProgressCount} In Progress</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{pendingCount} pending in queue</p>
            </div>
            <CircularDonutGraph
              percentage={tasks.length > 0 ? Math.round((inProgressCount / tasks.length) * 100) : 0}
              label="Burn"
              sublabel="Throughput"
              trend="up"
              size={64}
              strokeWidth={8}
            />
          </div>

          {/* Mini Multi-segment priority chart */}
          <div className="bg-[#121622] rounded-2xl p-5 border border-white/[0.06] flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority Breakdown</p>
              <p className="text-2xl font-display font-bold text-white mt-1">{highPriority} Urgent</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{medPriority} Med • {lowPriority} Low</p>
            </div>
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <MultiSegmentDonutChart
                segments={prioritySegments}
                totalLabel=""
                totalValue={tasks.length}
                size={64}
                showLegend={false}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#131824] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              placeholder="Search tasks..."
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#131824] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {PRIORITY_FILTERS.map((p) => (
              <button
                key={p}
                onClick={() => { setPriorityFilter(p); setPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  priorityFilter === p
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#131824] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {p === 'all' ? 'All Priority' : p}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Table / Card List */}
        {isLoading ? (
          <div className="bg-[#121622] rounded-2xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/[0.04] rounded-full" />
                  <div className="w-48 h-4 bg-white/[0.04] rounded" />
                </div>
                <div className="w-20 h-5 bg-white/[0.04] rounded-full" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-[#121622] rounded-2xl p-12 border border-white/[0.06] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-purple-400">
              <CheckSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">No tasks found</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs mx-auto">
              {search || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try clearing your search query or filters.'
                : 'Get started by creating your first task.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button onClick={handleOpenCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#121622] rounded-2xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04] shadow-sm">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                    {/* Checkbox toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(task)}
                      className="shrink-0 text-zinc-500 hover:text-emerald-400 transition-colors"
                      title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold truncate transition-colors ${
                            isCompleted ? 'line-through text-zinc-500' : 'text-white group-hover:text-blue-400'
                          }`}
                        >
                          {task.name}
                        </p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                        <span className="truncate">{task.projectName || 'General Workspace'}</span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right metadata & actions */}
                  <div className="flex items-center gap-4">
                    <StatusBadge status={task.status} />

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                        title="Edit task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(task)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="btn-ghost text-xs"
            >
              Previous
            </button>
            <span className="text-xs text-muted px-3">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
              disabled={page >= meta.totalPages}
              className="btn-ghost text-xs"
            >
              Next
            </button>
          </div>
        )}

        {/* Modals */}
        <TaskModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditTask(null); }}
          task={editTask}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={async (data) => {
            if (editTask) {
              await updateMutation.mutateAsync({ id: editTask.id, data });
            } else {
              await createMutation.mutateAsync(data as CreateTaskInput);
            }
          }}
        />

        <ConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          loading={deleteMutation.isPending}
        />
      </div>
    </AppShell>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0D14] flex items-center justify-center text-white">Loading tasks...</div>}>
      <TasksContent />
    </Suspense>
  );
}
export const dynamic = 'force-dynamic';
