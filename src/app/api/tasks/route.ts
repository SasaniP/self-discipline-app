import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { deadline: "asc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, deadline } = body;

    if (!title || !deadline) {
      return NextResponse.json(
        { error: "Title and deadline are required" },
        { status: 400 }
      );
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json({ error: "Invalid deadline" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        deadline: deadlineDate,
        status: "pending",
      },
    });

    // Ensure stats singleton exists
    await prisma.stats.upsert({
      where: { id: "singleton" },
      update: { tasksTotal: { increment: 1 } },
      create: { id: "singleton", tasksTotal: 1 },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
