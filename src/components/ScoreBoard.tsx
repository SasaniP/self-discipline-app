"use client";

import { Stats } from "@/lib/types";

interface Props {
  stats: Stats;
}

export default function ScoreBoard({ stats }: Props) {
  const completionRate =
    stats.tasksTotal > 0
      ? Math.round((stats.tasksOnTime / stats.tasksTotal) * 100)
      : 0;

  const getDisciplineRank = (score: number) => {
    if (score >= 1000) return { rank: "IRON WILL", color: "text-yellow-400" };
    if (score >= 500) return { rank: "DISCIPLINED", color: "text-green-400" };
    if (score >= 200) return { rank: "IMPROVING", color: "text-blue-400" };
    if (score >= 50) return { rank: "WEAK", color: "text-orange-400" };
    if (score >= 0) return { rank: "UNDISCIPLINED", color: "text-red-500" };
    return { rank: "PATHETIC", color: "text-red-700" };
  };

  const { rank, color } = getDisciplineRank(stats.totalScore);

  return (
    <div className="border border-[#1E2A34] bg-[#0E1318] p-5 rounded-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 border-b border-[#1E2A34] pb-3">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs text-[#6B8699] tracking-[0.2em] uppercase">
          Performance Report
        </span>
      </div>

      {/* Score */}
      <div className="mb-5">
        <div className="text-[#6B8699] text-xs tracking-widest mb-1">TOTAL SCORE</div>
        <div
          className="font-['Bebas_Neue'] text-6xl leading-none"
          style={{
            color: stats.totalScore < 0 ? "#FF2D2D" : "#C8D8E4",
          }}
        >
          {stats.totalScore < 0 ? "" : ""}{stats.totalScore}
        </div>
        <div className={`text-sm font-bold tracking-widest mt-1 ${color}`}>
          [{rank}]
        </div>
      </div>

      {/* Grid stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatBox label="STREAK" value={`${stats.streak}🔥`} />
        <StatBox label="BEST STREAK" value={`${stats.bestStreak}`} />
        <StatBox label="TASKS TOTAL" value={stats.tasksTotal} />
        <StatBox label="ON TIME" value={stats.tasksOnTime} highlight="ok" />
        <StatBox label="FAILED" value={stats.tasksFailed} highlight="accent" />
        <StatBox label="COMPLETION %" value={`${completionRate}%`} />
      </div>

      {/* Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-[#6B8699] mb-1">
          <span>SUCCESS RATE</span>
          <span>{completionRate}%</span>
        </div>
        <div className="h-1.5 bg-[#141B22] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completionRate}%`,
              background:
                completionRate >= 75
                  ? "var(--ok)"
                  : completionRate >= 50
                  ? "var(--warn)"
                  : "var(--accent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: "ok" | "accent";
}) {
  const valueColor =
    highlight === "ok"
      ? "text-green-400"
      : highlight === "accent"
      ? "text-red-500"
      : "text-[#C8D8E4]";

  return (
    <div className="bg-[#141B22] border border-[#1E2A34] p-2.5 rounded-sm">
      <div className="text-[#6B8699] text-[9px] tracking-widest mb-1">{label}</div>
      <div className={`font-bold text-lg ${valueColor}`}>{value}</div>
    </div>
  );
}
