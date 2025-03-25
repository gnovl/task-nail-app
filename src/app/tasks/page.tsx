import React from "react";
import TasksComponent from "../_components/TasksList";
import SidebarLayout from "../_components/SidebarLayout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "../lib/prisma";
import { TaskCategory } from "@prisma/client";

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "Low" | "Medium" | "High" | null;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  completed: boolean;
  status: string;
  category: TaskCategory | null;
  estimatedTime: number | null;
}

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
    category: task.category,
    estimatedTime: task.estimatedTime,
    viewed: task.viewed,
    pinned: task.pinned,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  }));
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  const tasks = session?.user?.id ? await getTasks(session.user.id) : [];

  return (
    <SidebarLayout tasks={tasks} isAddTaskPage={false}>
      <TasksComponent initialTasks={tasks} />
    </SidebarLayout>
  );
}
