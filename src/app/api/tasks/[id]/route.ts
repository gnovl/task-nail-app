import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "../../../lib/prisma";

export async function GET(
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
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const taskId = params.id;
  const updatedData = await request.json();

  console.log("Updating task:", taskId);
  console.log("Updated data:", updatedData);

  try {
    // Fetch the existing task
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if the due date is being updated
    if (updatedData.dueDate) {
      const newDueDate = new Date(updatedData.dueDate);
      const existingDueDate = existingTask.dueDate
        ? new Date(existingTask.dueDate)
        : null;
      const currentDate = new Date();

      // Function to check if two dates are in the same month and year
      const isSameMonthAndYear = (date1: Date, date2: Date) => {
        return (
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear()
        );
      };

      // If there's an existing due date, check if the new date is valid
      if (existingDueDate) {
        if (
          newDueDate < existingDueDate &&
          !isSameMonthAndYear(newDueDate, existingDueDate)
        ) {
          return NextResponse.json(
            { error: "New due date cannot be in a past month" },
            { status: 400 }
          );
        }
      } else {
        // If there's no existing due date, don't allow setting to a past date
        if (newDueDate < currentDate) {
          return NextResponse.json(
            { error: "Due date cannot be set to a past date" },
            { status: 400 }
          );
        }
      }

      // Ensure the date is in ISO format for Prisma
      updatedData.dueDate = newDueDate.toISOString();
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updatedData,
        lastEditedAt: new Date(), // Update lastEditedAt when content changes
        category: updatedData.category || null,
        // Make sure completedAt is properly handled
        completedAt:
          updatedData.status === "Completed"
            ? updatedData.completedAt || new Date()
            : null,
      },
    });

    console.log("Task updated:", updatedTask);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update task: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
