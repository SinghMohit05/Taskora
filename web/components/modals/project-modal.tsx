'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { CreateProjectInput, UpdateProjectInput, ProjectStatus, Project } from '@/lib/api';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => Promise<void>;
  project?: Project | null;
  loading?: boolean;
}

const STATUS_OPTIONS: ProjectStatus[] = ['Not Started', 'In Progress', 'Completed'];

export default function ProjectModal({ open, onClose, onSubmit, project, loading }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Not Started');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const isEditing = !!project;

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name);
        setDescription(project.description || '');
        setStatus(project.status);
        setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
        setEndDate(project.endDate ? project.endDate.split('T')[0] : '');
      } else {
        setName('');
        setDescription('');
        setStatus('Not Started');
        setStartDate('');
        setEndDate('');
      }
      setError('');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, project]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#121622] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-display font-bold text-white tracking-tight">
            {isEditing ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="project-name" className="block text-xs font-semibold text-zinc-400 mb-1.5">Project Name</label>
            <input
              ref={nameRef}
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              placeholder="e.g. Website Redesign"
              required
              maxLength={120}
            />
          </div>

          <div>
            <label htmlFor="project-desc" className="block text-xs font-semibold text-zinc-400 mb-1.5">Description</label>
            <textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors min-h-[80px] resize-none"
              placeholder="Brief project description..."
              maxLength={1000}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="project-status" className="block text-xs font-semibold text-zinc-400 mb-1.5">Status</label>
            <select
              id="project-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#121622] text-white">{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-xs font-semibold text-zinc-400 mb-1.5">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-xs font-semibold text-zinc-400 mb-1.5">End Date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
