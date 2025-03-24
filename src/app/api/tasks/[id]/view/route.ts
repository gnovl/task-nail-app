import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const taskId = params.id;

  try {
    // Use Prisma's executeRaw to update only the 'viewed' field
    // This ensures we don't affect the lastEditedAt field
    await prisma.$executeRaw`UPDATE "Task" SET "viewed" = true WHERE "id" = ${taskId}`;

    // Fetch the updated task to return
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error marking task as viewed:", error);
    return NextResponse.json(
      { error: "Failed to mark task as viewed" },
      { status: 500 }
    );
  }
}
