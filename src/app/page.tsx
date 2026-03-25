"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, Stats } from "@/lib/types";
import ScoreBoard from "@/components/ScoreBoard";
import TaskCard from "@/components/TaskCard";
import AddTaskModal from "@/components/AddTaskModal";
import GuiltTicker from "@/components/GuiltTicker";
import { Plus, RefreshCw } from "lucide-react";

type FilterTab = "active" | "completed" | "failed" | "all";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("active");
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [taskRes, statsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/stats"),
      ]);
      const [taskData, statsData] = await Promise.all([
        taskRes.json(),
        statsRes.json(),
      ]);
      setTasks(taskData);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Poll every 30s to auto-mark overdue
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return t.status === "pending" || t.status === "in_progress";
    if (filter === "completed") return t.status === "completed";
    if (filter === "failed") return t.status === "failed" || t.status === "abandoned";
    return true;
  });

  const activeTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  );
  const overdueCount = activeTasks.filter(
    (t) => new Date(t.deadline) < new Date()
  ).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "active", label: `ACTIVE (${activeTasks.length})` },
    { key: "completed", label: `DONE (${tasks.filter((t) => t.status === "completed").length})` },
    { key: "failed", label: `FAILED (${tasks.filter((t) => t.status === "failed" || t.status === "abandoned").length})` },
    { key: "all", label: "ALL" },
  ];

  const padTwo = (n: number) => String(n).padStart(2, "0");
  const clockStr = `${padTwo(time.getHours())}:${padTwo(time.getMinutes())}:${padTwo(time.getSeconds())}`;

  return (
    <div className="min-h-screen bg-[#080B0F] text-[#C8D8E4]">
      {/* Header */}
      <header className="border-b border-[#1E2A34] bg-[#080B0F] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-['Bebas_Neue'] text-3xl tracking-[0.15em] leading-none text-[#C8D8E4]">
                DISCIPLINE
              </h1>
              <p className="text-[9px] text-[#3D5060] tracking-[0.25em] mt-0.5">
                NO EXCUSES TASK SYSTEM
              </p>
            </div>
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/40 px-3 py-1.5 rounded-sm animate-[pulseRed_1.5s_ease-in-out_infinite]">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs font-bold tracking-widest">
                  {overdueCount} OVERDUE
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-['Bebas_Neue'] text-2xl tracking-widest text-[#6B8699]">
                {clockStr}
              </div>
              <div className="text-[9px] text-[#3D5060] tracking-widest">
                {time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
              </div>
            </div>
            <button
              onClick={() => fetchAll()}
              className="text-[#3D5060] hover:text-[#6B8699] transition-colors p-1"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Guilt ticker */}
      <GuiltTicker />

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6 items-start">
        {/* Left: task list */}
        <div className="flex-1 min-w-0">
          {/* Tabs + Add */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex gap-0.5 bg-[#0E1318] border border-[#1E2A34] p-0.5 rounded-sm overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-sm transition-all whitespace-nowrap ${
                    filter === tab.key
                      ? "bg-[#1E2A34] text-[#C8D8E4]"
                      : "text-[#3D5060] hover:text-[#6B8699]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-[#FF2D2D] hover:bg-[#E02020] text-white font-['Bebas_Neue'] text-lg tracking-widest px-4 py-2 rounded-sm transition-colors"
            >
              <Plus size={16} strokeWidth={3} />
              ADD TASK
            </button>
          </div>

          {/* Task list */}
          {loading ? (
            <div className="text-center py-20 text-[#3D5060] tracking-widest text-sm">
              LOADING...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="border border-dashed border-[#1E2A34] rounded-sm py-16 text-center">
              {filter === "active" ? (
                <>
                  <p className="font-['Bebas_Neue'] text-3xl text-[#1E2A34] mb-2">NO ACTIVE TASKS</p>
                  <p className="text-sm text-[#3D5060]">
                    Either you're on top of everything, or you haven't committed to anything yet.
                  </p>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="mt-4 text-xs text-[#FF2D2D] border border-[#FF2D2D]/30 px-4 py-2 rounded-sm hover:bg-[#FF2D2D]/10 transition-colors tracking-widest"
                  >
                    ADD YOUR FIRST TASK
                  </button>
                </>
              ) : (
                <p className="font-['Bebas_Neue'] text-3xl text-[#1E2A34]">NOTHING HERE</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={fetchAll} />
              ))}
            </div>
          )}
        </div>

        {/* Right: scoreboard */}
        <div className="w-64 shrink-0 sticky top-24 hidden lg:block">
          {stats ? (
            <ScoreBoard stats={stats} />
          ) : (
            <div className="border border-[#1E2A34] bg-[#0E1318] p-5 rounded-sm text-[#3D5060] text-xs tracking-widest">
              LOADING STATS...
            </div>
          )}

          {/* Score legend */}
          <div className="mt-4 border border-[#1E2A34] bg-[#0E1318] p-4 rounded-sm">
            <div className="text-[9px] text-[#3D5060] tracking-widest mb-3">SCORE GUIDE</div>
            <div className="space-y-1.5 text-xs">
              {[
                { g: "S", label: "Early finish", pts: "+120", color: "text-yellow-400" },
                { g: "A", label: "On time", pts: "+100", color: "text-green-400" },
                { g: "B", label: "<1h late", pts: "+75", color: "text-blue-400" },
                { g: "C", label: "1–24h late", pts: "+25–50", color: "text-orange-400" },
                { g: "F", label: ">24h late", pts: "+10", color: "text-red-500" },
                { g: "X", label: "Give up", pts: "−20", color: "text-gray-500" },
              ].map((row) => (
                <div key={row.g} className="flex items-center gap-2">
                  <span className={`font-['Bebas_Neue'] text-lg w-5 ${row.color}`}>{row.g}</span>
                  <span className="text-[#6B8699] flex-1">{row.label}</span>
                  <span className={row.color}>{row.pts}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#1E2A34] mt-3 pt-3 text-[10px] text-[#3D5060]">
              Deleting a task costs −30 pts.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stats button */}
      {stats && (
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <div className="bg-[#0E1318] border border-[#1E2A34] rounded-sm px-4 py-2 flex items-center gap-3">
            <div className="text-[9px] text-[#6B8699] tracking-widest">SCORE</div>
            <div
              className="font-['Bebas_Neue'] text-2xl"
              style={{ color: stats.totalScore < 0 ? "#FF2D2D" : "#C8D8E4" }}
            >
              {stats.totalScore}
            </div>
            <div className="text-orange-400 text-sm">🔥{stats.streak}</div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <AddTaskModal onClose={() => setShowAdd(false)} onAdded={fetchAll} />
      )}
    </div>
  );
}
