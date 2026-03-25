export type ScoreResult = {
  score: number;
  label: string;
  message: string;
  grade: "S" | "A" | "B" | "C" | "F" | "X";
};

/**
 * Calculate score when a task is completed.
 * @param deadline - when the task was due
 * @param startedAt - when the user hit "Start"
 * @param completedAt - when the user hit "Done"
 */
export function calculateScore(
  deadline: Date,
  startedAt: Date,
  completedAt: Date
): ScoreResult {
  const now = completedAt.getTime();
  const due = deadline.getTime();
  const started = startedAt.getTime();
  const totalWindow = due - started; // ms available
  const msLate = now - due; // negative = early
  const hoursLate = msLate / (1000 * 60 * 60);

  if (msLate <= 0) {
    // On time or early
    const earlyFraction = Math.abs(msLate) / Math.max(totalWindow, 1);
    if (earlyFraction >= 0.25) {
      return {
        score: 120,
        label: "AHEAD OF SCHEDULE",
        message: "You finished early. Rare. Respect.",
        grade: "S",
      };
    }
    return {
      score: 100,
      label: "ON TIME",
      message: "Task complete. As expected. Don't celebrate mediocrity.",
      grade: "A",
    };
  } else if (hoursLate <= 1) {
    return {
      score: 75,
      label: "SLIGHTLY LATE",
      message: "Close, but late is late. Fix your time estimates.",
      grade: "B",
    };
  } else if (hoursLate <= 6) {
    return {
      score: 50,
      label: "LATE",
      message: "Hours behind. You wasted time somewhere. Where?",
      grade: "C",
    };
  } else if (hoursLate <= 24) {
    return {
      score: 25,
      label: "VERY LATE",
      message: "A full day late. Disappointing.",
      grade: "C",
    };
  } else {
    return {
      score: 10,
      label: "DISGRACEFULLY LATE",
      message: "This is embarrassing. At least you finished.",
      grade: "F",
    };
  }
}

/**
 * Score for a failed (abandoned/overdue) task
 */
export function failedScore(): ScoreResult {
  return {
    score: 0,
    label: "FAILED",
    message: "You didn't do it. No excuses. Zero.",
    grade: "X",
  };
}

export const GUILT_MESSAGES = [
  "Every second you waste, someone else is getting ahead.",
  "Discipline is doing it when you don't feel like it.",
  "You said you'd do this. Was that a lie?",
  "Discomfort is temporary. Regret lasts forever.",
  "The task is still there. It won't do itself.",
  "Stop scrolling. Start working.",
  "Your future self will either thank you or curse you.",
  "One more minute wasted is one you can't get back.",
  "Motivation is for amateurs. You run on discipline.",
  "You don't need to feel ready. Just start.",
];

export const OVERDUE_MESSAGES = [
  "⚠ THIS TASK IS OVERDUE. Do it NOW.",
  "🔴 DEADLINE PASSED. You are already failing.",
  "TIME IS UP. Every minute you delay makes it worse.",
  "OVERDUE. Complete this immediately or mark it failed.",
];

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "S": return "text-yellow-400";
    case "A": return "text-green-400";
    case "B": return "text-blue-400";
    case "C": return "text-orange-400";
    case "F": return "text-red-500";
    case "X": return "text-gray-500";
    default: return "text-gray-400";
  }
}
