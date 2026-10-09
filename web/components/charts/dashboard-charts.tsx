'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChevronDown, MoreHorizontal } from 'lucide-react';
import type { Task, Project } from '@/lib/api';

// ─── 1. Project Overview Stacked Bar Chart ──────────────────────────────────────
interface ProjectOverviewChartProps {
  tasks: Task[];
  projects: Project[];
}

interface MonthDataPoint {
  month: string;
  monthIndex: number;
  year: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export function ProjectOverviewChart({ tasks, projects }: ProjectOverviewChartProps) {
  const [timeRange, setTimeRange] = useState<'Last 6 months' | 'By Project'>('Last 6 months');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const monthChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthsData: MonthDataPoint[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      monthsData.push({
        month: mName,
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        completed: 0,
        inProgress: 0,
        pending: 0,
      });
    }

    tasks.forEach((task) => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : task.createdAt ? new Date(task.createdAt) : now;
      const taskMonth = taskDate.getMonth();
      const slot = monthsData.find((m) => m.monthIndex === taskMonth);

      if (slot) {
        if (task.status === 'Completed') slot.completed += 1;
        else if (task.status === 'In Progress') slot.inProgress += 1;
        else slot.pending += 1;
      } else {
        const latest = monthsData[monthsData.length - 1];
        if (task.status === 'Completed') latest.completed += 1;
        else if (task.status === 'In Progress') latest.inProgress += 1;
        else latest.pending += 1;
      }
    });

    return monthsData.map((item) => ({
      name: item.month,
      completed: item.completed,
      inProgress: item.inProgress,
      pending: item.pending,
    }));
  }, [tasks]);

  const projectChartData = useMemo(() => {
    return projects.slice(0, 6).map((proj) => {
      const projTasks = tasks.filter((t) => t.projectId === proj.id);
      const completed = projTasks.filter((t) => t.status === 'Completed').length;
      const inProgress = projTasks.filter((t) => t.status === 'In Progress').length;
      const pending = projTasks.filter((t) => t.status === 'Pending').length;
      return {
        name: proj.name.length > 14 ? proj.name.slice(0, 12) + '...' : proj.name,
        completed,
        inProgress,
        pending,
      };
    });
  }, [tasks, projects]);

  const activeData = timeRange === 'Last 6 months' ? monthChartData : projectChartData;

  return (
    <div className="bg-[#121622] rounded-2xl p-6 border border-white/[0.06] shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-display font-bold text-white tracking-tight">Project Overview</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Task completion across your projects</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181D2D] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-[#181D2D] border border-white/[0.1] rounded-xl shadow-xl py-1 z-20">
              <button
                type="button"
                onClick={() => {
                  setTimeRange('Last 6 months');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  timeRange === 'Last 6 months' ? 'text-blue-400 font-semibold bg-white/[0.04]' : 'text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                Last 6 months
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeRange('By Project');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  timeRange === 'By Project' ? 'text-blue-400 font-semibold bg-white/[0.04]' : 'text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                By Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[240px] select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2435" />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1E2435' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#181D2D] border border-white/[0.1] rounded-xl p-3 shadow-xl text-xs">
                      <p className="font-semibold text-white mb-2">{label}</p>
                      <div className="space-y-1.5">
                        {payload.map((entry: any) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-zinc-400">{entry.name}:</span>
                            </div>
                            <span className="font-semibold text-white">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" />
            <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#3B82F6" />
            <Bar dataKey="pending" name="Pending" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/[0.04] mt-4 text-xs font-medium text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Tasks by Priority Donut Chart ───────────────────────────────────────────
interface TasksByPriorityChartProps {
  tasks: Task[];
  totalTasks: number;
}

export function TasksByPriorityChart({ tasks, totalTasks }: TasksByPriorityChartProps) {
  const { highCount, mediumCount, lowCount, total, highPct, mediumPct, lowPct, data } = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'High').length;
    const medium = tasks.filter((t) => t.priority === 'Medium').length;
    const low = tasks.filter((t) => t.priority === 'Low').length;

    const tot = totalTasks || tasks.length;
    const hPct = tot > 0 ? Math.round((high / tot) * 100) : 0;
    const mPct = tot > 0 ? Math.round((medium / tot) * 100) : 0;
    const lPct = tot > 0 ? Math.max(0, 100 - hPct - mPct) : 0;

    const d = [
      { name: 'High', value: high || (tot === 0 ? 1 : 0), color: '#EF4444' },
      { name: 'Medium', value: medium || (tot === 0 ? 1 : 0), color: '#F59E0B' },
      { name: 'Low', value: low || (tot === 0 ? 1 : 0), color: '#3B82F6' },
    ];
    return { highCount: high, mediumCount: medium, lowCount: low, total: tot, highPct: hPct, mediumPct: mPct, lowPct: lPct, data: d };
  }, [tasks, totalTasks]);

  return (
    <div className="bg-[#121622] rounded-2xl p-6 border border-white/[0.06] shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-display font-bold text-white tracking-tight">Tasks by Priority</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Distribution of tasks across priority levels</p>
        </div>
        <button
          type="button"
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Donut Canvas & Legend Layout */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 my-auto py-2">
        {/* Donut with center text */}
        <div className="relative w-44 h-44 xl:w-48 xl:h-48 shrink-0 flex items-center justify-center mx-auto xl:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={74}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0];
                    return (
                      <div className="bg-[#181D2D] border border-white/[0.1] rounded-xl px-3 py-1.5 shadow-xl text-xs font-semibold text-white">
                        <span style={{ color: d.payload.color }}>{d.name}:</span> {d.value} tasks
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-display font-extrabold text-white leading-none">
              {total}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 mt-1">Total Tasks</span>
          </div>
        </div>

        {/* Legend List matching reference */}
        <div className="w-full sm:w-auto flex-1 space-y-3">
          {/* High Priority */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="text-zinc-300 font-medium">High</span>
            </div>
            <span className="font-semibold text-white">{highCount}</span>
          </div>

          {/* Medium Priority */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-zinc-300 font-medium">Medium</span>
            </div>
            <span className="font-semibold text-white">{mediumCount}</span>
          </div>

          {/* Low Priority */}
          <div className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span className="text-zinc-300 font-medium">Low</span>
            </div>
            <span className="font-semibold text-white">{lowCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
