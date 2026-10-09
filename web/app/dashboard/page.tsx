'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import AppShell from '@/components/app-shell';
import { dashboardApi, projectsApi, tasksApi, authApi } from '@/lib/api';
import type { Task, Project, CreateProjectInput, CreateTaskInput } from '@/lib/api';
import { ProjectOverviewChart, TasksByPriorityChart } from '@/components/charts/dashboard-charts';
import ProjectModal from '@/components/modals/project-modal';
import TaskModal from '@/components/modals/task-modal';
import {
  Folder,
  CheckSquare,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Calendar,
  Globe,
  Smartphone,
  Megaphone,
  Rocket,
  Wrench,
  Circle,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Queries
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: authApi.getSession,
  });

  const { data: metrics } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getMetrics,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: () => projectsApi.list({ limit: 10, sortBy: 'createdAt', order: 'desc' }),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => tasksApi.list({ limit: 50, sortBy: 'dueDate', order: 'asc' }),
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Task created successfully');
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      tasksApi.update(id, { status: completed ? 'Completed' : 'Pending' }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'all'] });
      const previousTasks = queryClient.getQueryData(['tasks', 'all']);
      queryClient.setQueryData(['tasks', 'all'], (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((t: any) =>
            t.id === id ? { ...t, status: completed ? 'Completed' : 'Pending' } : t
          ),
        };
      });
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', 'all'], context.previousTasks);
      }
      toast.error('Failed to update task status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const m = metrics || {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    projectsInProgress: 0,
  };

  const allProjects = projectsData?.data || [];
  const allTasks = tasksData?.data || [];

  // Sort tasks intelligently: pending/in-progress first (by upcoming dueDate), then completed
  const upcomingTasks = useMemo(() => {
    const sortedTasks = [...allTasks].sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
    return sortedTasks.slice(0, 5);
  }, [allTasks]);

  const recentProjects = useMemo(() => allProjects.slice(0, 5), [allProjects]);

  // Dynamic rates
  const completionRate = m.totalTasks > 0 ? Math.round((m.completedTasks / m.totalTasks) * 100) : 0;
  const pendingRate = m.totalTasks > 0 ? Math.round((m.pendingTasks / m.totalTasks) * 100) : 0;
  const highPriorityCount = useMemo(() => allTasks.filter((t) => t.priority === 'High').length, [allTasks]);

  // User Greeting & Date
  const userName = sessionData?.user?.fullName || 'User';
  const firstName = userName.split(' ')[0];
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Project icon mapping
  const projectIcons = [
    { icon: Globe, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { icon: Smartphone, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { icon: Megaphone, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { icon: Rocket, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { icon: Wrench, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  ];

  function formatDueDate(dateString: string | null): { text: string; isToday: boolean; isTomorrow: boolean } {
    if (!dateString) return { text: 'No due date', isToday: false, isTomorrow: false };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { text: 'No due date', isToday: false, isTomorrow: false };

    const todayStr = now.toDateString();
    const dStr = d.toDateString();
    if (dStr === todayStr) return { text: 'Today', isToday: true, isTomorrow: false };

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (dStr === tomorrow.toDateString()) return { text: 'Tomorrow', isToday: false, isTomorrow: true };

    return {
      text: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      isToday: false,
      isTomorrow: false,
    };
  }

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* ─── 1. Dashboard Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#121622] border border-white/[0.06] rounded-2xl px-4 py-3 shrink-0 self-start sm:self-auto shadow-sm">
            <div className="text-right">
              <p className="text-xs font-semibold text-white flex items-center justify-end gap-2">
                <span>{formattedDate}</span>
                <Calendar className="w-4 h-4 text-zinc-400" />
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Stay productive. Keep going!</p>
            </div>
          </div>
        </div>

        {/* ─── 2. KPI Statistics Cards (4 Cards) ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Projects */}
          <div className="bg-[#121622] rounded-2xl p-5 border border-white/[0.06] shadow-sm hover:border-white/[0.1] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Folder className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setProjectModalOpen(true)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                title="Create Project"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-zinc-400">Total Projects</p>
              <p className="text-3xl font-display font-bold text-white mt-1 tracking-tight">
                {m.totalProjects}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                ↗ {m.projectsInProgress}
              </span>
              <span>in progress</span>
            </div>
          </div>

          {/* Total Tasks */}
          <div className="bg-[#121622] rounded-2xl p-5 border border-white/[0.06] shadow-sm hover:border-white/[0.1] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setTaskModalOpen(true)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                title="Create Task"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-zinc-400">Total Tasks</p>
              <p className="text-3xl font-display font-bold text-white mt-1 tracking-tight">
                {m.totalTasks}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                ↗ {highPriorityCount}
              </span>
              <span>high priority</span>
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-[#121622] rounded-2xl p-5 border border-white/[0.06] shadow-sm hover:border-white/[0.1] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-zinc-400">Completed Tasks</p>
              <p className="text-3xl font-display font-bold text-white mt-1 tracking-tight">
                {m.completedTasks}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                ↗ {completionRate}%
              </span>
              <span>completion rate</span>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-[#121622] rounded-2xl p-5 border border-white/[0.06] shadow-sm hover:border-white/[0.1] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <button
                type="button"
                className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-zinc-400">Pending Tasks</p>
              <p className="text-3xl font-display font-bold text-white mt-1 tracking-tight">
                {m.pendingTasks}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                • {pendingRate}%
              </span>
              <span>remaining</span>
            </div>
          </div>
        </div>

        {/* ─── 3. Charts Section (Project Overview & Tasks by Priority) ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 xl:col-span-8">
            <ProjectOverviewChart tasks={allTasks} projects={allProjects} />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <TasksByPriorityChart tasks={allTasks} totalTasks={m.totalTasks} />
          </div>
        </div>

        {/* ─── 4. Bottom Grid (Recent Projects & Upcoming Tasks) ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Projects Card */}
          <div className="lg:col-span-6 bg-[#121622] rounded-2xl p-6 border border-white/[0.06] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-display font-bold text-white tracking-tight">Recent Projects</h3>
                <Link
                  href="/projects"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View all →
                </Link>
              </div>

              {/* Projects List */}
              <div className="space-y-4">
                {projectsLoading ? (
                  <div className="py-12 text-center text-xs text-zinc-500">Loading projects...</div>
                ) : recentProjects.length === 0 ? (
                  <div className="py-12 text-center text-xs text-zinc-500">
                    No projects found. Create your first project to get started!
                  </div>
                ) : (
                  recentProjects.map((project, idx) => {
                    const iconConfig = projectIcons[idx % projectIcons.length];
                    const IconComponent = iconConfig.icon;
                    const pct =
                      project.taskCount > 0
                        ? Math.round((project.completedTaskCount / project.taskCount) * 100)
                        : 0;

                    // Dynamic bar color based on progress
                    const barColor =
                      pct >= 70 ? 'bg-[#10B981]' : pct >= 35 ? 'bg-[#3B82F6]' : 'bg-[#8B5CF6]';

                    const dueText = project.endDate
                      ? `Due ${new Date(project.endDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                        })}`
                      : 'Ongoing';

                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Icon & Title */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconConfig.color}`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                              {project.name}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar & Value */}
                        <div className="hidden sm:flex items-center gap-3 shrink-0">
                          <div className="w-24 lg:w-28 h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-zinc-300 w-9 text-right">{pct}%</span>
                        </div>

                        {/* Due Date & Action */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-zinc-400 hidden sm:inline">{dueText}</span>
                          <button
                            type="button"
                            className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.04] mt-5">
              <button
                type="button"
                onClick={() => setProjectModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 border border-white/[0.06]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Upcoming Tasks Card */}
          <div className="lg:col-span-6 bg-[#121622] rounded-2xl p-6 border border-white/[0.06] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-display font-bold text-white tracking-tight">Upcoming Tasks</h3>
                <Link
                  href="/tasks"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View all →
                </Link>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasksLoading ? (
                  <div className="py-12 text-center text-xs text-zinc-500">Loading tasks...</div>
                ) : upcomingTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-zinc-500">
                    No pending tasks! All caught up.
                  </div>
                ) : (
                  upcomingTasks.map((task) => {
                    const dueInfo = formatDueDate(task.dueDate);
                    const isDone = task.status === 'Completed';

                    // Priority Badge styles matching reference
                    const priorityStyles: Record<string, string> = {
                      High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                      Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                      Low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    };

                    const badgeStyle = priorityStyles[task.priority] || priorityStyles.Medium;

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-3.5 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Checkbox & Name */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              toggleTaskMutation.mutate({ id: task.id, completed: !isDone })
                            }
                            className="shrink-0 text-zinc-500 hover:text-emerald-400 transition-colors"
                            title={isDone ? 'Mark Pending' : 'Mark Completed'}
                          >
                            {isDone ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p
                              className={`text-sm font-semibold truncate transition-colors ${
                                isDone ? 'line-through text-zinc-500' : 'text-white group-hover:text-blue-400'
                              }`}
                            >
                              {task.name}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5 truncate">
                              {task.projectName || 'General Workspace'}
                            </p>
                          </div>
                        </div>

                        {/* Priority Pill Badge */}
                        <div className="shrink-0">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Due Date & Menu */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div
                            className={`flex items-center gap-1.5 text-xs ${
                              dueInfo.isToday
                                ? 'text-rose-400 font-semibold'
                                : dueInfo.isTomorrow
                                ? 'text-amber-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{dueInfo.text}</span>
                          </div>

                          <button
                            type="button"
                            className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.04] mt-5">
              <button
                type="button"
                onClick={() => setTaskModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 border border-white/[0.06]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals for Adding Projects & Tasks */}
      <ProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        loading={createProjectMutation.isPending}
        onSubmit={async (data) => {
          await createProjectMutation.mutateAsync(data as CreateProjectInput);
        }}
      />

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        loading={createTaskMutation.isPending}
        onSubmit={async (data) => {
          await createTaskMutation.mutateAsync(data as CreateTaskInput);
        }}
      />
    </AppShell>
  );
}
