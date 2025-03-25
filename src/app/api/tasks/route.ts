import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "../../lib/prisma";

// Handle GET requests - keeping original code unchanged
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        lastEditedAt: true,
        dueDate: true,
        priority: true,
        status: true,
        category: true,
        viewed: true,
        pinned: true,
        completed: true,
        completedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { message: "Error fetching tasks" },
      { status: 500 }
    );
  }
}

// Updated POST request handler with date validation
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title, description, dueDate, priority, status, category } =
    await request.json();

  // Validate required fields
  if (!title || title.trim() === "") {
    return NextResponse.json(
      { message: "Task title is required" },
      { status: 400 }
    );
  }

  // Validate due date is not in the past
  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today

    if (dueDateObj < today) {
      return NextResponse.json(
        { message: "Due date cannot be in the past" },
        { status: 400 }
      );
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status,
        category,
        user: { connect: { id: user.id } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { message: "Error creating task" },
      { status: 500 }
    );
  }
}
