"use client";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

import {
  PlusIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface Task {
  id: string;
  title: string;
}

interface SidebarLayoutProps {
  children: ReactNode;
  tasks: Task[];
  activeTaskId?: string;
  isAddTaskPage?: boolean;
  isTasksPage?: boolean;
}

export default function SidebarLayout({
  children,
  tasks,
  activeTaskId,
  isAddTaskPage,
  isTasksPage,
}: SidebarLayoutProps) {
  const [taskCount, setTaskCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTaskCount() {
      try {
        const response = await fetch("/api/taskcount");
        if (response.ok) {
          const data = await response.json();
          setTaskCount(data.count);
        } else {
          console.error("Failed to fetch task count");
        }
      } catch (error) {
        console.error("Error fetching task count:", error);
      }
    }

    fetchTaskCount();
  }, []);

  const displayedTasks = tasks.slice(0, 10);
  const hasMoreTasks = tasks.length > 10;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4">
          <h2 className="text-xl font-semibold">ezTaskFlow</h2>
          <Link
            href="/new"
            className={`flex items-center mt-4 ${
              isAddTaskPage
                ? "bg-orange-100 text-orange-600"
                : "text-orange-600 hover:bg-gray-100"
            } px-2 py-1 rounded`}
          >
            <PlusIcon className="mr-2" width={20} height={20} />
            Add task
          </Link>
          <Link
            href="/tasks"
            className={`flex items-center mt-2 ${
              isTasksPage
                ? "bg-orange-100 text-orange-600"
                : "text-orange-600 hover:bg-gray-100"
            } px-2 py-1 rounded`}
          >
            <QueueListIcon className="mr-2" width={20} height={20} />
            All Tasks
            {taskCount !== null && (
              <span className="ml-auto bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">
                {taskCount}
              </span>
            )}
          </Link>
        </div>
        <nav className="mt-8 flex-grow flex flex-col min-h-0">
          <h3 className="px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
            Recents
          </h3>
          <ul className="mt-2">
            {displayedTasks.map((task) => (
              <li
                key={task.id}
                className={`px-4 py-2 ${
                  task.id === activeTaskId
                    ? "bg-orange-100 text-orange-600"
                    : "hover:bg-gray-100"
                }`}
              >
                <Link
                  href={`/task/${task.id}`}
                  className="flex items-center text-sm text-gray-700"
                >
                  <ClipboardDocumentListIcon
                    className="mr-2 flex-shrink-0"
                    width={16}
                    height={16}
                  />
                  <span className="truncate">{task.title}</span>
                </Link>
              </li>
            ))}
            {hasMoreTasks && (
              <li className="px-4 py-2 hover:bg-gray-100">
                <Link
                  href="/tasks"
                  className="flex items-center text-sm text-orange-600 hover:text-orange-800"
                >
                  <span className="truncate mr-1">View all</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">{children}</div>
    </div>
  );
}
