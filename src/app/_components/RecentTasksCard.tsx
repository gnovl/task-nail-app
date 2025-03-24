// src/app/_components/RecentTasksCard.tsx
import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  createdAt: string;
  viewed: boolean;
  priority: "High" | "Medium" | "Low" | null;
  status: string;
}

interface RecentTasksCardProps {
  tasks: Task[];
  isLoading?: boolean;
}

const RecentTasksCard = ({
  tasks,
  isLoading = false,
}: RecentTasksCardProps) => {
  const recentTasks = tasks.slice(0, 3);

  const handleTaskClick = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/view`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Error marking task as viewed:", error);
    }
  };

  // Task Item Skeleton component
  const TaskItemSkeleton = () => (
    <div className="flex items-center justify-between px-3 py-2 animate-pulse">
      <div className="flex items-center min-w-0 flex-1 pl-3">
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
      <div className="flex items-center gap-3 ml-2">
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h2 className="text-base font-medium text-gray-900">
              Recent Tasks
            </h2>
          </div>
          <Link
            href="/tasks"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            View all
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="space-y-1 min-h-[120px]">
            <TaskItemSkeleton />
            <TaskItemSkeleton />
            <TaskItemSkeleton />
          </div>
        ) : recentTasks.length > 0 ? (
          <div className="space-y-1">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                href={`/task/${task.id}`}
                onClick={() => handleTaskClick(task.id)}
                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md group relative"
              >
                {!task.viewed && isNewTask(task.createdAt) && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
                <div className="flex items-center min-w-0 flex-1 pl-3">
                  <span className="text-sm text-gray-600 truncate group-hover:text-gray-900">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      task.status === "Completed"
                        ? "bg-green-50 text-green-700"
                        : task.status === "In Progress"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {task.status}
                  </span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {format(new Date(task.createdAt), "MMM dd")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const isNewTask = (createdAt: string) => {
  const taskDate = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - taskDate.getTime();
  return diff < 24 * 60 * 60 * 1000;
};

export default RecentTasksCard;
