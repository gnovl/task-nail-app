// src/app/tasks/page.tsx
import React from "react";
import TasksComponent from "../_components/TasksList";
import SidebarLayout from "../_components/SidebarLayout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "../lib/prisma";

async function getTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    priority: task.priority as "Low" | "Medium" | "High" | null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    description: task.description,
    completed: task.completed,
    status: task.status,
    tags: task.tags,
    estimatedTime: task.estimatedTime,
  }));
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  const tasks = session?.user?.id ? await getTasks(session.user.id) : [];

  return (
    <SidebarLayout tasks={tasks} isTasksPage={true}>
      <TasksComponent initialTasks={tasks} />
    </SidebarLayout>
  );
}
