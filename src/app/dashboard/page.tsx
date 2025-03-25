// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import SidebarLayout from "../_components/SidebarLayout";
import RecentTasksCard from "../_components/RecentTasksCard";
import DashboardQuickActions from "../_components/DashboardQuickActions";
import TodayTasks from "../_components/TodayTasks";
import { format } from "date-fns";
import { PulseLoader } from "react-spinners";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  priority: "High" | "Medium" | "Low" | null;
  status: string;
  category: string | null;
  completed: boolean;
  estimatedTime: number | null;
  viewed: boolean;
  isNew?: boolean;
  pinned: boolean;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Check if session is loading
  const isSessionLoading = status === "loading";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoadingTasks(true);
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        const tasksWithMeta = data.map((task: Task) => ({
          ...task,
          isNew: isNewTask(task.createdAt),
        }));
        setTasks(tasksWithMeta);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      const newTask = await response.json();
      setTasks((prevTasks) => [{ ...newTask, isNew: true }, ...prevTasks]);
      showToast("✅ New task added successfully", "success");
      return newTask;
    } catch (error) {
      console.error("Error in handleCreateTask:", error);
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        showToast("Failed to create task", "error");
      }
      throw error; // Re-throw to allow the calling component to handle it
    }
  };

  // Add this new method to handle task creation from the sidebar
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const isNewTask = (createdAt: string) => {
    const taskDate = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - taskDate.getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <SidebarLayout
      tasks={tasks}
      isAddTaskPage={true}
      onTaskCreated={handleTaskCreated}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg text-gray-500">
              Welcome back,
            </span>
            {isSessionLoading ? (
              <span className="flex items-center h-6">
                <PulseLoader color="#4B5563" size={6} margin={2} />
              </span>
            ) : (
              <span className="text-base sm:text-lg font-medium text-gray-900">
                {session?.user?.name?.split(" ")[0] || "there"}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-0">
            {format(currentTime, "EEEE, MMMM d • HH:mm")}
          </p>
        </div>
        {/* Quick Actions & Calendar */}
        <DashboardQuickActions
          tasks={tasks}
          isLoading={isLoadingTasks}
          onCreateTask={handleCreateTask}
        />

        {/* Today's Tasks Overview */}
        <div className="mb-6">
          <TodayTasks tasks={tasks} isLoading={isLoadingTasks} />
        </div>

        {/* Recent Tasks */}
        <RecentTasksCard tasks={tasks} isLoading={isLoadingTasks} />

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg ${
                toast.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              } flex items-center space-x-2 min-w-[300px]`}
              style={{
                animation: "slideIn 0.3s ease-out, slideOut 0.3s ease-in 2.7s",
              }}
            >
              <span className="flex-1">{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
