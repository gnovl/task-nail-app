"use client";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu } from "@headlessui/react";
import { usePathname, useRouter } from "next/navigation";
import Hamburger from "hamburger-react";
import { appVersion } from "../config/version";

import {
  PlusIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  ArrowRightIcon,
  UserCircleIcon,
  CogIcon,
  ArrowLeftEndOnRectangleIcon,
  ChevronDownIcon,
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
}

export default function SidebarLayout({
  children,
  tasks,
  activeTaskId,
}: SidebarLayoutProps) {
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);

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

    if (status === "authenticated") {
      fetchTaskCount();
    }
  }, [status]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const displayedTasks = tasks.slice(0, 7);
  const hasMoreTasks = tasks.length > 7;

  const isAddTaskPage = pathname === "/new";
  const isTasksPage = pathname === "/tasks";

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/" });
    router.push(data?.url ?? "/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Hamburger menu for mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Hamburger
          toggled={isOpen}
          toggle={setOpen}
          size={20}
          easing="ease-in"
        />
      </div>

      {/* Overlay for mobile when sidebar is open */}
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
        } w-64 h-screen bg-white shadow-md flex flex-col z-50`}
      >
        <div className="p-4 mt-14 lg:mt-0">
          <h2 className="text-xl font-semibold">taskEzy</h2>
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
              <span className="ml-auto bg-gray-300 text-gray-800 rounded-full px-2 py-1 text-xs">
                {taskCount}
              </span>
            )}
          </Link>
        </div>
        <nav className="mt-8 flex-grow flex flex-col min-h-0">
          <h3 className="px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
            Recents
          </h3>
          <ul className="mt-2 overflow-y-auto">
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
        {/* Dividing line */}
        <div className="border-t border-gray-200 my-4"></div>
        {/* User Profile Section */}
        <div className="mt-auto p-4">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
              <UserCircleIcon className="w-8 h-8 text-gray-500 mr-2" />
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-700">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/settings"
                    className={`${
                      active ? "bg-gray-100" : ""
                    } flex items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <CogIcon className="w-5 h-5 mr-2" />
                    Settings
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={`${
                      active ? "bg-gray-100" : ""
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    <ArrowLeftEndOnRectangleIcon className="w-5 h-5 mr-2" />
                    Log out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
        {/* Version Display */}
        <div className="px-4 py-2 text-xs text-gray-500 text-center border-gray-200">
          {appVersion.display}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto lg:ml-0 ml-0 pt-20 lg:pt-8">
        {children}
      </div>
    </div>
  );
}
