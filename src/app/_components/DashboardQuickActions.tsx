import React, { useState } from "react";
import TaskCalendar from "./TaskCalendar";
import { Pin, Plus, Flag } from "lucide-react";
import Link from "next/link";
import QuickTaskModal from "./QuickTaskModal";

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "High" | "Medium" | "Low" | null;
  status: string;
  pinned: boolean;
  category?: string | null;
}

interface DashboardQuickActionsProps {
  tasks: Task[];
  isLoading?: boolean;
  onCreateTask?: (taskData: any) => Promise<void>;
}

const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  tasks,
  isLoading = false,
  onCreateTask,
}) => {
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pinnedTasks = tasks.filter((task) => task.pinned).slice(0, 3);
  const hasMorePinnedTasks = tasks.filter((task) => task.pinned).length > 3;

  const handleQuickAction = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setSelectedDate(date);
    setIsQuickTaskModalOpen(true);
  };

  const handleTaskCreation = async (taskData: any) => {
    setError(null);

    try {
      if (onCreateTask) {
        await onCreateTask(taskData);
        setIsQuickTaskModalOpen(false);
      }
    } catch (error: any) {
      setError(error.message || "Failed to create task");
      throw error; // Re-throw to let the modal component handle it
    }
  };

  const getPriorityFlagColor = (priority: string | null) => {
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

  const handleTaskView = async (taskId: string) => {
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
    <div className="flex items-center justify-between py-2 px-3 animate-pulse">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="w-16 h-4 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {error && (
        <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-gray-500" />
            <h2 className="text-base font-medium text-gray-900">
              Pinned Tasks
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickAction(0)}
              className="px-3 py-1.5 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              Add for today
            </button>
            <button
              onClick={() => handleQuickAction(1)}
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Tomorrow
            </button>
          </div>
        </div>

        <div className="space-y-1 min-h-[120px]">
          {isLoading ? (
            <>
              <TaskItemSkeleton />
              <TaskItemSkeleton />
              <TaskItemSkeleton />
            </>
          ) : pinnedTasks.length > 0 ? (
            <>
              {pinnedTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/task/${task.id}`}
                  onClick={() => handleTaskView(task.id)}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md group"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Flag
                      className={`w-4 h-4 flex-shrink-0 ${getPriorityFlagColor(
                        task.priority
                      )}`}
                    />
                    <span
                      className="text-sm text-gray-600 group-hover:text-gray-900 truncate"
                      title={task.title}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                    {task.status}
                  </span>
                </Link>
              ))}
              {hasMorePinnedTasks && (
                <div className="text-sm text-gray-500 pl-2 pt-1">
                  +{tasks.filter((task) => task.pinned).length - 3} more pinned
                  tasks
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic py-6 text-center">
              No pinned tasks
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <TaskCalendar tasks={tasks} compact={true} isLoading={isLoading} />
      </div>

      <QuickTaskModal
        isOpen={isQuickTaskModalOpen}
        onClose={() => setIsQuickTaskModalOpen(false)}
        onSubmit={handleTaskCreation}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default DashboardQuickActions;
