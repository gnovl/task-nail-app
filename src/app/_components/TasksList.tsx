"use client";
import React, { useState, useEffect } from "react";
import { PulseLoader } from "react-spinners";
import { format } from "date-fns";
import {
  CalendarIcon,
  FlagIcon,
  ClockIcon,
  TrashIcon,
  XMarkIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
  CheckIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

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
  tags: any[]; // Replace 'any' with your TaskTag type if available
  estimatedTime: number | null;
}

interface TasksComponentProps {
  initialTasks: Task[];
}

interface Toast {
  message: string;
  type: "success" | "error";
}

type SortOption =
  | "dueDate"
  | "priority"
  | "createdAt"
  | "updatedAt"
  | "title"
  | "status";

// Helper function for status styling
const getStatusStyle = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800";
    case "Not Started":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const SortChip: React.FC<{
  option: SortOption;
  label: string;
  icon: React.ReactNode;
  currentSort: SortOption | null;
  onClick: (option: SortOption) => void;
}> = ({ option, label, icon, currentSort, onClick }) => (
  <button
    onClick={() => onClick(option)}
    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2 ${
      currentSort === option
        ? "bg-blue-500 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    {icon}
    <span className="ml-1">{label}</span>
  </button>
);

const TasksComponent: React.FC<TasksComponentProps> = ({ initialTasks }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tasksToDelete, setTasksToDelete] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption | null>(null);
  const [originalOrder, setOriginalOrder] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (currentSort) {
      sortTasks(currentSort);
    } else {
      setTasks([...originalOrder]);
    }
  }, [currentSort, originalOrder]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const shuffleArray = (array: Task[]) => {
    return array
      .map((task) => ({ ...task, sortKey: Math.random() }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ sortKey, ...task }) => task);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      // Shuffle tasks before setting them in state
      const shuffledTasks = shuffleArray(data);
      setTasks(shuffledTasks);
      setOriginalOrder(shuffledTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showToast("Failed to fetch tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const selectAllTasks = () => {
    setSelectedTasks(tasks.map((task) => task.id));
  };

  const cancelSelection = () => {
    setSelectedTasks([]);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const openDeleteModal = () => {
    setTasksToDelete(selectedTasks);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTasksToDelete([]);
  };

  const deleteSelectedTasks = async () => {
    let successCount = 0;
    let errorCount = 0;

    for (const taskId of tasksToDelete) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Failed to delete task ${taskId}`);
        }
        successCount++;
      } catch (error) {
        console.error(`Error deleting task ${taskId}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      showToast(`Successfully deleted ${successCount} task(s)`, "success");
    }
    if (errorCount > 0) {
      showToast(`Failed to delete ${errorCount} task(s)`, "error");
    }

    fetchTasks();
    setSelectedTasks([]);
    closeDeleteModal();
  };

  const sortTasks = (option: SortOption) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      switch (option) {
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          // Sort from newest to oldest due date (descending order)
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1, null: 0 };
          return (
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
          );
        case "createdAt":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "updatedAt":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "status":
          const statusOrder = {
            Completed: 3,
            "In Progress": 2,
            "Not Started": 1,
          };
          return (
            (statusOrder[b.status as keyof typeof statusOrder] || 0) -
            (statusOrder[a.status as keyof typeof statusOrder] || 0)
          );
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    setTasks(sortedTasks);
  };

  const handleSortClick = (option: SortOption) => {
    if (currentSort === option) {
      // When unselecting a sort option, restore original order
      setCurrentSort(null);
    } else {
      setCurrentSort(option);
      sortTasks(option);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasksToDelete([taskId]);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 text-lg flex items-center gap-3">
          Loading tasks
          <PulseLoader color="#4B5563" size={8} speedMultiplier={0.8} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-2">
      {tasks.length > 0 ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold">All Tasks</h1>
            <div className="flex items-center space-x-2">
              <Link
                href="/new"
                className="group flex items-center px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md ring-2 ring-gray-200 hover:ring-gray-300"
              >
                <svg
                  className="w-4 h-4 mr-1.5 transform group-hover:rotate-90 group-hover:stroke-gray-800 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="group-hover:text-gray-800">New Task</span>
              </Link>{" "}
              <button
                onClick={toggleViewMode}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
                title={`Switch to ${
                  viewMode === "grid" ? "list" : "grid"
                } view`}
              >
                {viewMode === "grid" ? (
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <SortChip
              option="dueDate"
              label="Due Date"
              icon={<CalendarIcon className="w-4 h-4" />}
              currentSort={currentSort}
              onClick={handleSortClick}
            />
            <SortChip
              option="priority"
              label="Priority"
              icon={<FlagIcon className="w-4 h-4" />}
              currentSort={currentSort}
              onClick={handleSortClick}
            />
            <SortChip
              option="createdAt"
              label="Created"
              icon={<ClockIcon className="w-4 h-4" />}
              currentSort={currentSort}
              onClick={handleSortClick}
            />
            <SortChip
              option="updatedAt"
              label="Last Modified"
              icon={<PencilIcon className="w-4 h-4" />}
              currentSort={currentSort}
              onClick={handleSortClick}
            />
            <SortChip
              option="title"
              label="Title"
              icon={<ClipboardDocumentListIcon className="w-4 h-4" />}
              currentSort={currentSort}
              onClick={handleSortClick}
            />
            <SortChip
              option="status"
              label="Status"
              icon={<CheckCircleIcon className="w-4 h-4" />}
              currentSort={currentSort}
              onClick={handleSortClick}
            />
          </div>

          {selectedTasks.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>{selectedTasks.length} selected task(s)</span>
              </div>
              <button
                onClick={selectAllTasks}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Select All
              </button>
              <button
                onClick={cancelSelection}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={openDeleteModal}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                title="Delete selected tasks"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          <div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white shadow-md rounded-lg overflow-hidden p-4 transition-colors duration-200 ${
                  viewMode === "grid" ? "flex flex-col" : "flex items-center"
                } relative group ${
                  selectedTasks.includes(task.id)
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "hover:bg-gray-100"
                }`}
              >
                <div
                  className={`absolute top-2 right-2 flex items-center space-x-2 ${
                    selectedTasks.length > 0 || selectedTasks.includes(task.id)
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  } transition-opacity duration-200`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {selectedTasks.length === 0 && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Link href={`/task/${task.id}`} className="flex-grow">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {task.title}
                  </div>
                  <div
                    className={`flex ${
                      viewMode === "grid"
                        ? "flex-col space-y-2"
                        : "flex-wrap items-center"
                    } text-gray-500 text-xs`}
                  >
                    <div
                      className={`flex items-center ${
                        viewMode === "list" ? "mr-4" : ""
                      }`}
                    >
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>
                        Due Date:{" "}
                        {task.dueDate
                          ? format(new Date(task.dueDate), "MMM dd, yyyy")
                          : "No due date"}
                      </span>
                    </div>
                    <div
                      className={`flex items-center ${
                        viewMode === "list" ? "mr-4" : ""
                      }`}
                    >
                      <FlagIcon className="w-4 h-4 mr-1" />
                      <span>Priority: {task.priority ?? "No priority"}</span>
                    </div>
                    <div
                      className={`flex items-center ${
                        viewMode === "list" ? "mr-4" : ""
                      }`}
                    >
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>
                        Created:{" "}
                        {isValidDate(task.createdAt)
                          ? format(new Date(task.createdAt), "MMM dd, yyyy")
                          : "Invalid date"}
                      </span>
                    </div>
                    <div
                      className={`flex items-center ${
                        viewMode === "list" ? "mr-4" : ""
                      }`}
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      <span>
                        Last Modified:{" "}
                        {isValidDate(task.updatedAt)
                          ? format(new Date(task.updatedAt), "MMM dd, yyyy")
                          : "Invalid date"}
                      </span>
                    </div>
                    <div
                      className={`flex items-center ${
                        viewMode === "list" ? "mr-4" : ""
                      }`}
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      <div
                        className={`inline-flex items-center ${getStatusStyle(
                          task.status
                        )} px-2 py-1 rounded-full text-xs font-medium`}
                      >
                        {task.status}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <ClipboardDocumentIcon className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mb-4" />
          <p className="text-lg sm:text-xl font-medium text-gray-500 mb-6 text-center">
            No tasks yet! Let's get started!
          </p>
          <Link
            href="/new"
            className="inline-flex items-center px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create your first task
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-4">
              Are you sure you want to delete {tasksToDelete.length} selected
              task(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedTasks}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-out">
          <div
            className={`px-4 py-2 rounded shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksComponent;
