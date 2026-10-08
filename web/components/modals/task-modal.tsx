'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority, Task, Project } from '@/lib/api';
import { projectsApi } from '@/lib/api';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  task?: Task | null;
  defaultProjectId?: string;
  loading?: boolean;
}

const STATUS_OPTIONS: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High'];

export default function TaskModal({ open, onClose, onSubmit, task, defaultProjectId, loading }: TaskModalProps) {
  const [projectId, setProjectId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const isEditing = !!task;

  // Fetch projects for the dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsApi.list({ limit: 100 }),
    enabled: open,
  });

  const projects = projectsData?.data || [];

  useEffect(() => {
    if (open) {
      if (task) {
        setProjectId(task.projectId);
        setName(task.name);
        setDescription(task.description || '');
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      } else {
        setProjectId(defaultProjectId || '');
        setName('');
        setDescription('');
        setStatus('Pending');
        setPriority('Medium');
        setDueDate('');
      }
      setError('');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, task, defaultProjectId]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Task name is required');
      return;
    }

    if (!isEditing && !projectId) {
      setError('Please select a project');
      return;
    }

    try {
      const data: any = {
        name: name.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      if (!isEditing) {
        data.projectId = projectId;
      }

      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#121622] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-display font-bold text-white tracking-tight">
            {isEditing ? 'Edit Task' : 'New Task'}
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

          {!isEditing && (
            <div>
              <label htmlFor="task-project" className="block text-xs font-semibold text-zinc-400 mb-1.5">Project</label>
              <select
                id="task-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                required
              >
                <option value="" className="bg-[#121622] text-zinc-400">Select a project...</option>
                {projects.map((p: Project) => (
                  <option key={p.id} value={p.id} className="bg-[#121622] text-white">{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="task-name" className="block text-xs font-semibold text-zinc-400 mb-1.5">Task Name</label>
            <input
              ref={nameRef}
              id="task-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors"
              placeholder="e.g. Design homepage mockup"
              required
              maxLength={150}
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-zinc-400 mb-1.5">Description</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/60 transition-colors min-h-[80px] resize-none"
              placeholder="Brief task description..."
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-status" className="block text-xs font-semibold text-zinc-400 mb-1.5">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-[#121622] text-white">{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-zinc-400 mb-1.5">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p} className="bg-[#121622] text-white">{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-due" className="block text-xs font-semibold text-zinc-400 mb-1.5">Due Date</label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#181D2D] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
            />
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
              ) : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
