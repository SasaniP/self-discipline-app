export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "abandoned";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string;
  startedAt: string | null;
  completedAt: string | null;
  status: TaskStatus;
  score: number | null;
  penalty: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  id: string;
  totalScore: number;
  streak: number;
  bestStreak: number;
  tasksTotal: number;
  tasksOnTime: number;
  tasksFailed: number;
}

export interface ScoreResult {
  score: number;
  label: string;
  message: string;
  grade: "S" | "A" | "B" | "C" | "F" | "X";
}
