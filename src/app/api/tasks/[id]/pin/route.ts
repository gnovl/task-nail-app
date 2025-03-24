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
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { user: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.user.email !== session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { pinned: !task.pinned },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating pin status:", error);
    return NextResponse.json(
      { error: "Failed to update pin status" },
      { status: 500 }
    );
  }
}
