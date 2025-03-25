// src/app/_components/TodayOverviewModal.tsx
import React, { useState } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Link from "next/link";
import QuickTaskModal from "./QuickTaskModal";

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "High" | "Medium" | "Low" | null;
  status: string;
}

interface TodayOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  selectedDate: Date | null;
}

const TodayOverviewModal: React.FC<TodayOverviewModalProps> = ({
  isOpen,
  onClose,
  tasks,
  selectedDate,
}) => {
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  if (!isOpen) return null;

  const today = new Date();
  const todaysTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate).toDateString() === today.toDateString()
  );
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < today &&
      new Date(task.dueDate).toDateString() !== today.toDateString() &&
      task.status !== "Completed"
  );
  const completedToday = todaysTasks.filter(
    (task) => task.status === "Completed"
  );
  const pendingToday = todaysTasks.filter(
    (task) => task.status !== "Completed"
  );

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      setToast({ message: "✅ Task created successfully", type: "success" });
      setTimeout(() => setToast(null), 3000);
      setIsQuickTaskModalOpen(false);
      window.location.reload(); // Refresh to show new task
    } catch (error) {
      console.error("Error creating task:", error);
      setToast({ message: "❌ Failed to create task", type: "error" });
      setTimeout(() => setToast(null), 3000);
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

  const formatRelativeTime = (dateString: string) => {
    // For due dates, consider end of day as the deadline
    const date = new Date(dateString);
    date.setHours(23, 59, 59); // Set to end of the due date

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    // If less than 60 minutes since end of due date
    if (diffInMinutes < 60) return "Just now";

    const diffInHours = Math.floor(diffInMinutes / 60);
    // If less than 24 hours since end of due date
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;

    return format(date, "MMM d, yyyy");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Today&apos;s Overview
              <span className="block text-sm text-gray-500 font-normal">
                {format(today, "MMMM d, yyyy")}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {/* Quick Add Task Button */}
            <button
              onClick={() => setIsQuickTaskModalOpen(true)}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add task for today
            </button>

            {/* Rest of your existing task sections */}
            <div className="space-y-4">
              {/* Pending Tasks */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Pending Today ({pendingToday.length})
                </h3>
                {pendingToday.length > 0 ? (
                  <div className="space-y-1">
                    {pendingToday.map((task) => (
                      <Link
                        key={task.id}
                        href={`/task/${task.id}?source=dashboard`}
                        onClick={() => handleTaskView(task.id)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            task.priority
                          )}`}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {task.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No pending tasks for today
                  </p>
                )}
              </div>

              {/* Completed Tasks */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Completed Today ({completedToday.length})
                </h3>
                {completedToday.length > 0 ? (
                  <div className="space-y-1">
                    {completedToday.map((task) => (
                      <Link
                        key={task.id}
                        href={`/task/${task.id}?source=dashboard`}
                        onClick={() => handleTaskView(task.id)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md group"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-500 group-hover:text-gray-700 line-through">
                          {task.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No completed tasks yet
                  </p>
                )}
              </div>

              {/* Overdue Tasks */}
              {overdueTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-red-600 mb-2">
                    Overdue Tasks ({overdueTasks.length})
                  </h3>
                  <div className="space-y-1">
                    {overdueTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/task/${task.id}?source=dashboard`}
                        onClick={() => handleTaskView(task.id)}
                        className="flex items-center gap-2 p-2 hover:bg-red-50 rounded-md group"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm text-red-600 group-hover:text-red-700">
                          {task.title}
                        </span>
                        <span className="text-xs text-red-500 ml-auto">
                          {formatRelativeTime(task.dueDate!)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QuickTaskModal */}
      <QuickTaskModal
        isOpen={isQuickTaskModalOpen}
        onClose={() => setIsQuickTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        selectedDate={selectedDate}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            } flex items-center space-x-2 min-w-[300px]`}
          >
            <span className="flex-1">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default TodayOverviewModal;
