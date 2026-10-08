'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/app-shell';
import ProjectModal from '@/components/modals/project-modal';
import ConfirmModal from '@/components/modals/confirm-modal';
import { projectsApi } from '@/lib/api';
import type { Project, ProjectStatus, CreateProjectInput, UpdateProjectInput } from '@/lib/api';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderKanban,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Not Started': 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
        styles[status] || styles['Not Started']
      }`}
    >
      {status}
    </span>
  );
}

function MiniCircularProgress({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const strokeColor = pct >= 70 ? '#10B981' : pct >= 35 ? '#3B82F6' : '#8B5CF6';

  return (
    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
      <svg className="w-10 h-10 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#242B3D"
          strokeWidth="3.5"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">{pct}%</span>
    </div>
  );
}

const STATUS_FILTER_OPTIONS: (ProjectStatus | 'all')[] = ['all', 'Not Started', 'In Progress', 'Completed'];

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search, statusFilter, page],
    queryFn: () =>
      projectsApi.list({
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: 12,
      }),
  });

  const projects = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };

  const createMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteTarget(null);
    },
  });

  const handleOpenCreate = () => {
    setEditProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditProject(project);
    setModalOpen(true);
  };

  return (
    <AppShell>
      <div className="max-w-[1580px] mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Portfolio</span>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight mt-0.5">
              Projects
            </h1>
          </div>
          <button onClick={handleOpenCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#131824] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              placeholder="Search projects..."
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTER_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#131824] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {s === 'all' ? 'All Projects' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#121622] rounded-2xl p-6 border border-white/[0.06] h-[190px] animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-32 h-5 bg-white/[0.04] rounded-lg" />
                  <div className="w-20 h-5 bg-white/[0.04] rounded-full" />
                </div>
                <div className="w-full h-3 bg-white/[0.04] rounded mb-2" />
                <div className="w-3/4 h-3 bg-white/[0.04] rounded mb-6" />
                <div className="w-full h-2 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#121622] rounded-2xl p-12 border border-white/[0.06] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-blue-400">
              <FolderKanban className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">No projects found</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs mx-auto">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by creating your first milestone project.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button onClick={handleOpenCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className="bg-[#121622] rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.12] group flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 shadow-sm"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div>
                    {/* Top row: Name & Status badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-base font-bold font-display text-white group-hover:text-blue-400 transition-colors truncate flex-1"
                      >
                        {project.name}
                      </Link>
                      <StatusBadge status={project.status} />
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px] leading-relaxed mb-4">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Circular progress & task statistics */}
                  <div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#181D2D] mb-4 border border-white/[0.06]">
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Completion</p>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {project.completedTaskCount} of {project.taskCount} tasks
                        </p>
                      </div>
                      <MiniCircularProgress
                        completed={project.completedTaskCount}
                        total={project.taskCount}
                      />
                    </div>

                    {/* Bottom actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(project)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(project)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          </>
        )}

        {/* Modals */}
        <ProjectModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditProject(null); }}
          project={editProject}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={async (data) => {
            if (editProject) {
              await updateMutation.mutateAsync({ id: editProject.id, data });
            } else {
              await createMutation.mutateAsync(data as CreateProjectInput);
            }
          }}
        />

        <ConfirmModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently delete all associated tasks.`}
          loading={deleteMutation.isPending}
        />
      </div>
    </AppShell>
  );
}
