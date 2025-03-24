import { TaskCategory } from "@prisma/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedAt: string;
  dueDate: string | null;
  priority: "High" | "Medium" | "Low" | null;
  status: string;
  category: TaskCategory | null;
  completed: boolean;
  estimatedTime: number | null;
  viewed: boolean;
  isNew?: boolean;
  pinned: boolean;
}
