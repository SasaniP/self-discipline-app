import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const stats = await prisma.stats.findUnique({ where: { id: "singleton" } });
    return NextResponse.json(
      stats || {
        id: "singleton",
        totalScore: 0,
        streak: 0,
        bestStreak: 0,
        tasksTotal: 0,
        tasksOnTime: 0,
        tasksFailed: 0,
      }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
