"use client";

import { useState, useEffect, useRef } from "react";
import { Task, ScoreResult } from "@/lib/types";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { Play, CheckCircle, XCircle, Trash2, Clock, AlertTriangle } from "lucide-react";

interface Props {
  task: Task;
  onUpdate: () => void;
}

export default function TaskCard({ task, onUpdate }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [confirmFail, setConfirmFail] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const deadline = new Date(task.deadline);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = deadline.getTime() - now;
      setIsOverdue(diff < 0);

      if (diff <= 0) {
        const abs = Math.abs(diff);
        const h = Math.floor(abs / 3600000);
        const m = Math.floor((abs % 3600000) / 60000);
        const s = Math.floor((abs % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s OVERDUE`);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (h > 24) {
          setTimeLeft(formatDistanceToNow(deadline, { addSuffix: true }));
        } else {
          setTimeLeft(`${h}h ${m}m ${s}s`);
        }
      }
    };

    if (task.status === "pending" || task.status === "in_progress") {
      update();
      intervalRef.current = setInterval(update, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [task.deadline, task.status]);

  const doAction = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.scoreResult) setScoreResult(data.scoreResult);
      onUpdate();
    } finally {
      setLoading(null);
    }
  };

  const doDelete = async () => {
    setLoading("delete");
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      onUpdate();
    } finally {
      setLoading(null);
    }
  };

  const statusConfig = {
    pending: {
      color: "border-[#1E2A34]",
      badge: "bg-[#1E2A34] text-[#6B8699]",
      label: "PENDING",
    },
    in_progress: {
      color: isOverdue ? "border-red-500/60" : "border-orange-500/60",
      badge: "bg-orange-500/20 text-orange-400",
      label: "IN PROGRESS",
    },
    completed: {
      color: "border-green-500/40",
      badge: "bg-green-500/20 text-green-400",
      label: "COMPLETED",
    },
    failed: {
      color: "border-red-800/40",
      badge: "bg-red-900/30 text-red-500",
      label: "FAILED",
    },
    abandoned: {
      color: "border-gray-800",
      badge: "bg-gray-800 text-gray-600",
      label: "ABANDONED",
    },
  };

  const cfg = statusConfig[task.status];
  const isDone = task.status === "completed" || task.status === "failed" || task.status === "abandoned";

  const gradeColors: Record<string, string> = {
    S: "text-yellow-400",
    A: "text-green-400",
    B: "text-blue-400",
    C: "text-orange-400",
    F: "text-red-500",
    X: "text-gray-500",
  };

  return (
    <div
      className={`border bg-[#0E1318] rounded-sm transition-all duration-300 ${cfg.color} ${
        task.status === "in_progress" && isOverdue ? "animate-[pulseRed_2s_ease-in-out_infinite]" : ""
      }`}
    >
      {/* Overdue banner */}
      {isOverdue && task.status === "in_progress" && (
        <div className="bg-red-500 text-white text-[10px] font-bold tracking-widest text-center py-1 px-3">
          ⚠ DEADLINE PASSED — COMPLETE OR MARK FAILED NOW
        </div>
      )}
      {isOverdue && task.status === "pending" && (
        <div className="bg-red-900/80 text-red-300 text-[10px] font-bold tracking-widest text-center py-1 px-3">
          ⚠ OVERDUE AND NOT EVEN STARTED — START IMMEDIATELY
        </div>
      )}

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[9px] font-bold tracking-[0.2em] px-2 py-0.5 rounded-sm ${cfg.badge}`}
              >
                {cfg.label}
              </span>
              {task.score !== null && (
                <span
                  className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm border ${
                    task.score >= 100
                      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                      : task.score >= 75
                      ? "border-green-500/40 bg-green-500/10 text-green-400"
                      : task.score >= 50
                      ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                      : "border-red-500/40 bg-red-500/10 text-red-400"
                  }`}
                >
                  +{task.score} PTS
                </span>
              )}
              {task.penalty > 0 && (
                <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm border border-red-700/40 bg-red-700/10 text-red-600">
                  −{task.penalty} PTS
                </span>
              )}
            </div>
            <h3
              className={`font-bold text-base leading-tight ${
                isDone && task.status !== "completed"
                  ? "line-through text-[#3D5060]"
                  : "text-[#C8D8E4]"
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-[#6B8699] mt-1 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Time info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-[#6B8699]">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-[#3D5060]" />
            <span>
              Deadline:{" "}
              <span className={isOverdue && !isDone ? "text-red-400 font-bold" : "text-[#C8D8E4]"}>
                {format(deadline, "MMM d, HH:mm")}
              </span>
            </span>
          </div>
          {(task.status === "pending" || task.status === "in_progress") && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle
                size={11}
                className={isOverdue ? "text-red-500" : "text-orange-400"}
              />
              <span
                className={
                  isOverdue
                    ? "text-red-400 font-bold animate-[flash_1s_ease-in-out_infinite]"
                    : "text-orange-400"
                }
              >
                {timeLeft}
              </span>
            </div>
          )}
          {task.completedAt && (
            <div className="flex items-center gap-1.5">
              <CheckCircle size={11} className="text-green-500" />
              <span>
                Done:{" "}
                <span className="text-[#C8D8E4]">
                  {format(new Date(task.completedAt), "MMM d, HH:mm")}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Score result flash */}
        {scoreResult && (
          <div className={`mb-3 border rounded-sm p-3 text-xs ${
            scoreResult.score >= 100
              ? "border-yellow-500/40 bg-yellow-500/10"
              : scoreResult.score >= 75
              ? "border-green-500/40 bg-green-500/10"
              : scoreResult.score >= 50
              ? "border-orange-500/40 bg-orange-500/10"
              : "border-red-500/40 bg-red-500/10"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-['Bebas_Neue'] text-2xl ${gradeColors[scoreResult.grade]}`}>
                {scoreResult.grade}
              </span>
              <span className="font-bold tracking-widest text-[10px] text-[#C8D8E4]">
                {scoreResult.label}
              </span>
              <span className="ml-auto font-bold text-[#C8D8E4]">+{scoreResult.score}</span>
            </div>
            <p className="text-[#6B8699] italic">{scoreResult.message}</p>
          </div>
        )}

        {/* Actions */}
        {!isDone && (
          <div className="flex flex-wrap gap-2 mt-2">
            {task.status === "pending" && (
              <button
                onClick={() => doAction("start")}
                disabled={!!loading}
                className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 text-xs font-bold tracking-widest px-3 py-2 rounded-sm transition-all disabled:opacity-50"
              >
                <Play size={12} />
                {loading === "start" ? "..." : "START NOW"}
              </button>
            )}

            {task.status === "in_progress" && (
              <button
                onClick={() => doAction("complete")}
                disabled={!!loading}
                className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 text-xs font-bold tracking-widest px-3 py-2 rounded-sm transition-all disabled:opacity-50"
              >
                <CheckCircle size={12} />
                {loading === "complete" ? "..." : "MARK DONE"}
              </button>
            )}

            {/* Fail */}
            {!confirmFail ? (
              <button
                onClick={() => setConfirmFail(true)}
                className="flex items-center gap-1.5 bg-red-900/20 hover:bg-red-900/30 border border-red-800/40 text-red-600 text-xs font-bold tracking-widest px-3 py-2 rounded-sm transition-all"
              >
                <XCircle size={12} />
                GIVE UP
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-400">−{task.status === "pending" ? 20 : 20} pts. Confirm?</span>
                <button
                  onClick={() => { doAction("fail"); setConfirmFail(false); }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 px-2 py-1 border border-red-700/50 rounded-sm"
                >
                  YES, I QUIT
                </button>
                <button
                  onClick={() => setConfirmFail(false)}
                  className="text-xs text-[#6B8699] hover:text-[#C8D8E4] px-2 py-1"
                >
                  CANCEL
                </button>
              </div>
            )}

            {/* Delete */}
            {!confirmDelete && task.status === "pending" && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="ml-auto text-[#3D5060] hover:text-red-600 transition-colors p-2"
                title="Delete task (-30pts)"
              >
                <Trash2 size={14} />
              </button>
            )}
            {confirmDelete && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-xs text-red-400">−30 pts. Delete?</span>
                <button
                  onClick={() => { doDelete(); setConfirmDelete(false); }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 px-2 py-1 border border-red-700/50 rounded-sm"
                >
                  DELETE
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-[#6B8699] hover:text-[#C8D8E4] px-2 py-1"
                >
                  NO
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
