import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateScore, failedScore } from "@/lib/scoring";

type RouteContext = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json();
    const { action } = body;

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (action === "start") {
      if (task.status !== "pending") {
        return NextResponse.json({ error: "Task already started or done" }, { status: 400 });
      }
      const updated = await prisma.task.update({
        where: { id: params.id },
        data: { status: "in_progress", startedAt: new Date() },
      });
      return NextResponse.json(updated);
    }

    if (action === "complete") {
      if (task.status === "completed") {
        return NextResponse.json({ error: "Already completed" }, { status: 400 });
      }
      const completedAt = new Date();
      const startedAt = task.startedAt || task.createdAt;
      const result = calculateScore(task.deadline, startedAt, completedAt);

      const updated = await prisma.task.update({
        where: { id: params.id },
        data: {
          status: "completed",
          completedAt,
          score: result.score,
        },
      });

      // Update stats
      await prisma.stats.upsert({
        where: { id: "singleton" },
        update: {
          totalScore: { increment: result.score },
          tasksOnTime: result.score >= 75 ? { increment: 1 } : undefined,
          streak: result.score >= 50 ? { increment: 1 } : { set: 0 },
        },
        create: {
          id: "singleton",
          totalScore: result.score,
          tasksOnTime: result.score >= 75 ? 1 : 0,
          streak: result.score >= 50 ? 1 : 0,
        },
      });

      return NextResponse.json({ task: updated, scoreResult: result });
    }

    if (action === "fail") {
      const result = failedScore();
      const updated = await prisma.task.update({
        where: { id: params.id },
        data: { status: "failed", score: 0, penalty: 20 },
      });
      await prisma.stats.upsert({
        where: { id: "singleton" },
        update: {
          tasksFailed: { increment: 1 },
          streak: { set: 0 },
          totalScore: { decrement: 20 },
        },
        create: { id: "singleton", tasksFailed: 1, totalScore: -20 },
      });
      return NextResponse.json({ task: updated, scoreResult: result });
    }

    if (action === "abandon") {
      const updated = await prisma.task.update({
        where: { id: params.id },
        data: { status: "abandoned", score: 0, penalty: 30 },
      });
      await prisma.stats.upsert({
        where: { id: "singleton" },
        update: {
          tasksFailed: { increment: 1 },
          streak: { set: 0 },
          totalScore: { decrement: 30 },
        },
        create: { id: "singleton", tasksFailed: 1, totalScore: -30 },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  // Deleting a pending task = abandonment penalty
  try {
    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (task.status === "pending" || task.status === "in_progress") {
      await prisma.stats.upsert({
        where: { id: "singleton" },
        update: {
          tasksFailed: { increment: 1 },
          streak: { set: 0 },
          totalScore: { decrement: 30 },
        },
        create: { id: "singleton", tasksFailed: 1, totalScore: -30 },
      });
    }

    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
