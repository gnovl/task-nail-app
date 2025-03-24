// src/app/_components/tasks/TasksTypes.ts
import { ReactNode } from "react";
import {
  Calendar,
  Flag,
  Check,
  CheckCircle,
  ClipboardList,
  Tag,
  AlertCircle,
  RotateCw,
  ListTodo,
  Clock,
  Columns,
  Pencil,
  Pin,
} from "lucide-react";

export type SortOption =
  | "dueDate"
  | "priority"
  | "createdAt"
  | "updatedAt"
  | "title"
  | "status"
  | "category"
  | "pinned";

export type FilterOption =
  | "all"
  | "overdue"
  | "dueToday"
  | "dueTomorrow"
  | "completed"
  | "notStarted"
  | "inProgress";

export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "Low" | "Medium" | "High" | null;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
  description: string | null;
  completed: boolean;
  completedAt: string | null;
  status: string;
  category: string | null;
  estimatedTime: number | null;
  viewed: boolean;
  pinned: boolean;
}

export interface Toast {
  message: string;
  type: "success" | "error";
  icon?: string;
  undoAction?: () => void;
}

export interface SortOptionType {
  key: string;
  label: string;
  icon: React.ElementType;
}

export interface FilterOptionType {
  key: string;
  label: string;
  icon: React.ElementType;
}

export const sortOptions: SortOptionType[] = [
  { key: "pinned", label: "Pinned", icon: Pin },
  { key: "category", label: "Category", icon: Tag },
  { key: "createdAt", label: "Created Date", icon: Clock },
  { key: "updatedAt", label: "Last Edited", icon: Pencil },
  { key: "dueDate", label: "Due Date", icon: Calendar },
  { key: "priority", label: "Priority", icon: Flag },
  { key: "status", label: "Status", icon: CheckCircle },
  { key: "title", label: "Title", icon: ListTodo },
];

export const filterOptions: FilterOptionType[] = [
  { key: "all", label: "All Tasks", icon: ListTodo },
  { key: "overdue", label: "Overdue", icon: AlertCircle },
  { key: "dueToday", label: "Due Today", icon: Clock },
  { key: "dueTomorrow", label: "Due Tomorrow", icon: Calendar },
  { key: "completed", label: "Completed", icon: CheckCircle },
  { key: "notStarted", label: "Not Started", icon: ClipboardList },
  { key: "inProgress", label: "In Progress", icon: RotateCw },
];

export const getPriorityFlagColor = (priority: string | null) => {
  switch (priority) {
    case "High":
      return "text-red-500";
    case "Medium":
      return "text-orange-500";
    case "Low":
      return "text-green-500";
    default:
      return "text-gray-400";
  }
};

// Function to check if a date string is valid
export const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Helper to shuffle tasks array
export const shuffleArray = (array: Task[]) => {
  return array
    .map((task) => ({ ...task, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey, ...task }) => task);
};

export const isTaskOverdue = (task: Task) => {
  if (!task.dueDate || task.status === "Completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
};
