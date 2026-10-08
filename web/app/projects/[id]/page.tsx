'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/app-shell';
import ProjectModal from '@/components/modals/project-modal';
import TaskModal from '@/components/modals/task-modal';
import ConfirmModal from '@/components/modals/confirm-modal';
import { projectsApi, tasksApi } from '@/lib/api';
import type { ProjectDetail, Task, TaskStatus, CreateTaskInput, UpdateTaskInput, UpdateProjectInput } from '@/lib/api';
import { ExecutiveProgressRing } from '@/components/charts/circular-graphs';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  Circle,
  FolderKanban,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Not Started': 'bg-zinc-100 text-zinc-600 border border-zinc-200/60',
    'In Progress': 'bg-zinc-900 text-white',
    Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  };
  return <span className={`status-badge text-[11px] font-semibold ${styles[status] || styles['Not Started']}`}>{status}</span>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId),
    enabled: !!projectId,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: UpdateProjectInput) => projectsApi.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditProjectModalOpen(false);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/projects');
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTaskModalOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTaskModalOpen(false);
      setEditTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTaskTarget(null);
    },
  });

  const handleToggleTask = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await updateTaskMutation.mutateAsync({ id: task.id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-[1400px] mx-auto p-6 space-y-6 animate-pulse">
          <div className="w-32 h-6 bg-subtle rounded-lg" />
          <div className="card-premium p-8 h-48 bg-subtle rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto py-16 text-center">
          <h2 className="text-xl font-bold font-display text-ink mb-2">Project Not Found</h2>
          <p className="text-sm text-muted mb-6">The requested project could not be found or has been deleted.</p>
          <Link href="/projects" className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  const tasks = project.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Top back navigation */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Projects</span>
        </Link>

        {/* Executive Project Hero Banner */}
        <div className="bg-[#121622] rounded-2xl border border-white/[0.06] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              {project.description || 'No description provided for this project.'}
            </p>

            {/* Date range if available */}
            {(project.startDate || project.endDate) && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} —{' '}
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
            )}
          </div>

          {/* Right circular ring and actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ExecutiveProgressRing
              percentage={pct}
              title="Execution"
              description={`${completedTasks} of ${tasks.length} finished`}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditProjectModalOpen(true)}
                className="btn-secondary !py-2 !px-3 text-xs"
                title="Edit Project"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteProjectConfirm(true)}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Project Tasks Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h3 className="text-lg font-display font-bold text-white">Project Deliverables</h3>
            <p className="text-xs text-zinc-400">All active tasks mapped to this milestone</p>
          </div>
          <button
            onClick={() => { setEditTask(null); setTaskModalOpen(true); }}
            className="btn-primary text-xs !py-2 !px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="bg-[#121622] rounded-2xl border border-white/[0.06] p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-blue-400">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No tasks yet</h4>
            <p className="text-xs text-zinc-400 mb-4">Add tasks to track the deliverables for this project.</p>
            <button
              onClick={() => { setEditTask(null); setTaskModalOpen(true); }}
              className="btn-primary text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Task</span>
            </button>
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
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
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
                      <p
                        className={`text-sm font-semibold truncate transition-colors ${
                          isCompleted ? 'line-through text-zinc-500' : 'text-white group-hover:text-blue-400'
                        }`}
                      >
                        {task.name}
                      </p>
                      {task.description && (
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {task.priority}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditTask(task); setTaskModalOpen(true); }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                        title="Edit task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTaskTarget(task)}
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

        {/* Modals */}
        <ProjectModal
          open={editProjectModalOpen}
          onClose={() => setEditProjectModalOpen(false)}
          project={project}
          loading={updateProjectMutation.isPending}
          onSubmit={async (data) => {
            await updateProjectMutation.mutateAsync(data);
          }}
        />

        <TaskModal
          open={taskModalOpen}
          onClose={() => { setTaskModalOpen(false); setEditTask(null); }}
          task={editTask}
          defaultProjectId={projectId}
          loading={createTaskMutation.isPending || updateTaskMutation.isPending}
          onSubmit={async (data) => {
            if (editTask) {
              await updateTaskMutation.mutateAsync({ id: editTask.id, data });
            } else {
              await createTaskMutation.mutateAsync({ ...(data as CreateTaskInput), projectId });
            }
          }}
        />

        <ConfirmModal
          open={!!deleteTaskTarget}
          onClose={() => setDeleteTaskTarget(null)}
          onConfirm={() => deleteTaskTarget && deleteTaskMutation.mutate(deleteTaskTarget.id)}
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteTaskTarget?.name}"? This action cannot be undone.`}
          loading={deleteTaskMutation.isPending}
        />

        <ConfirmModal
          open={deleteProjectConfirm}
          onClose={() => setDeleteProjectConfirm(false)}
          onConfirm={() => deleteProjectMutation.mutate()}
          title="Delete Project"
          message={`Are you sure you want to delete "${project.name}"? This will permanently delete all associated tasks.`}
          loading={deleteProjectMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
