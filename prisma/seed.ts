import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.stats.deleteMany();

  const now = new Date();

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Read 20 pages of your current book",
        description: "No phone. No distractions. Just read.",
        deadline: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2h from now
        status: "pending",
      },
      {
        title: "Complete one LeetCode problem",
        description: "Medium difficulty. No hints unless you've tried for 30 minutes.",
        deadline: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4h from now
        status: "pending",
      },
      {
        title: "Write 500 words on your project",
        description: "Just open the doc and start typing. The ideas will follow.",
        deadline: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1h from now
        status: "in_progress",
        startedAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
    ],
  });

  // Init stats
  await prisma.stats.create({
    data: {
      id: "singleton",
      totalScore: 0,
      streak: 0,
      bestStreak: 0,
      tasksTotal: 3,
      tasksOnTime: 0,
      tasksFailed: 0,
    },
  });

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
