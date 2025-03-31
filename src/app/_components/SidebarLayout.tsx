// src/app/_components/SidebarLayout.tsx
"use client";

import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu } from "@headlessui/react";
import { usePathname, useRouter } from "next/navigation";
import Hamburger from "hamburger-react";
import { appVersion } from "../config/version";
import QuickTaskModal from "./QuickTaskModal";
import {
  LayoutDashboard,
  ListTodo,
  User,
  Settings,
  LogOut,
  ChevronDown,
  PlusCircle,
} from "lucide-react";
import { PulseLoader } from "react-spinners";

interface Task {
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

interface SidebarLayoutProps {
  children: ReactNode;
  tasks: Task[];
  activeTaskId?: string;
  isAddTaskPage?: boolean;
  onTaskCreated?: (newTask: Task) => void;
}

export default function SidebarLayout({
  children,
  tasks,
  activeTaskId,
  isAddTaskPage,
  onTaskCreated,
}: SidebarLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);
  const [isQuickTaskModalOpen, setIsQuickTaskModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    // If unauthenticated and not already on login page, redirect once
    if (status === "unauthenticated" && window.location.pathname !== "/login") {
      router.push("/login");
    }
  }, [status, router]);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isLoading = status === "loading";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isTasksPage = pathname === "/tasks";
  const isDashboardPage = pathname === "/dashboard";

  const handleSignOut = async () => {
    showToast("Logging out...", "success");
    // Wait a moment to show the toast before redirecting
    setTimeout(async () => {
      const data = await signOut({ redirect: false, callbackUrl: "/" });
      router.push(data?.url ?? "/");
    }, 1500);
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      const newTask = await response.json();
      showToast("✅ Task created successfully", "success");
      setIsQuickTaskModalOpen(false);

      // Call the callback if it exists
      if (onTaskCreated) {
        onTaskCreated({ ...newTask, isNew: true });
      }

      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      showToast("Failed to create task", "error");
      throw error;
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-60 h-screen bg-white shadow-sm flex flex-col z-50`}
      >
        {/* Logo area */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">TaskNail</h2>
        </div>

        {/* Create New Task Button (Positioned at the top) */}
        <div className="px-2 mb-2">
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setIsQuickTaskModalOpen(true);
            }}
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-3 text-green-600" />
            Create New Task
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2">
          <Link
            href="/dashboard"
            className={`flex items-center px-3 py-2 my-1 rounded-md text-sm font-medium transition-colors ${
              isDashboardPage
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Link>

          <Link
            href="/tasks"
            className={`flex items-center px-3 py-2 my-1 rounded-md text-sm font-medium transition-colors ${
              isTasksPage
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <ListTodo className="w-4 h-4 mr-3" />
            Tasks
          </Link>
        </nav>

        {/* User section with loading state */}
        <div className="p-3 border-t border-gray-100">
          {isLoading ? (
            <div className="px-3 py-2 flex items-center">
              <div className="w-4 h-4 text-gray-500 mr-3">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1.5 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center w-full px-3 py-2 text-left rounded-md hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4 text-gray-500 mr-3" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Menu.Button>

              <Menu.Items className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/settings"
                      className={`${
                        active ? "bg-gray-50" : ""
                      } flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900`}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? "bg-gray-50" : ""
                      } flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900`}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Log out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          )}
        </div>

        {/* Version display with app name - smaller size */}
        <div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
          TaskNail {appVersion.full}
        </div>
      </div>

      <div className="flex-1 overflow-auto lg:ml-0 ml-0 pb-8 flex flex-col">
        {/* Mobile header with hamburger - made sticky and hidden on tasks page */}
        <div
          className={`sticky top-0 z-40 bg-white lg:hidden border-b border-gray-200 shadow-sm ${
            isTasksPage ? "hidden" : ""
          }`}
        >
          <div className="py-3 px-4 flex items-center">
            <div className="flex-1 flex items-center">
              <Hamburger
                toggled={isOpen}
                toggle={setOpen}
                size={20}
                color="#4B5563"
              />
            </div>
            <div className="flex-1 text-center">
              <span className="text-base font-medium text-gray-900">
                TaskNail
              </span>
            </div>
            <div className="flex-1">
              {/* Empty div to balance the layout */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-grow">{children}</div>
      </div>

      {/* QuickTaskModal for the sidebar "Create New Task" button */}
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
            style={{
              animation: "slideIn 0.3s ease-out, slideOut 0.3s ease-in 2.7s",
            }}
          >
            <span className="flex-1">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
