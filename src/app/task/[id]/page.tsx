// src/app/task/[id]/page.tsx
"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SidebarLayout from "../../_components/SidebarLayout";
import {
  CalendarIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  XMarkIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  TagIcon,
  ArrowLongLeftIcon,
} from "@heroicons/react/24/outline";
import PulseLoader from "react-spinners/PulseLoader";

// Updated Task interface to match the one used elsewhere in the application
interface Task {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
  dueDate: string | null;
  priority: "High" | "Medium" | "Low" | null;
  status: string;
  category: string | null;
  completed: boolean;
  estimatedTime: number | null;
  viewed: boolean;
  pinned: boolean;
}

export default function TaskDetailPage() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const source = searchParams.get("source") || "dashboard";
  const [task, setTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 270;
  const MAX_TITLE_LENGTH = 60;

  // Get displayTitle for the breadcrumb
  const displayTitle = task?.title
    ? task.title.length > 25
      ? `${task.title.substring(0, 25)}...`
      : task.title
    : "Loading...";

  // Update when editing starts
  useEffect(() => {
    if (isEditing && editedTask?.description) {
      setCharCount(editedTask.description.length);
    }
  }, [isEditing, editedTask?.description]);

  // Handle description change with character limit
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARS) {
      setEditedTask({ ...editedTask!, description: newValue });
      setCharCount(newValue.length);
    }
  };

  // Handle title change with character limit
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_TITLE_LENGTH) {
      setEditedTask({ ...editedTask!, title: newValue });
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;

    return format(date, "MMM d, yyyy • h:mm a");
  };

  useEffect(() => {
    fetchTasks();
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error("Failed to fetch tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
        setEditedTask(data);
      } else {
        console.error("Failed to fetch task");
      }
    } catch (error) {
      console.error("Error fetching task:", error);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async () => {
    if (!editedTask) return;

    // Create a sanitized version of the task for the API
    const taskToUpdate = {
      title: editedTask.title,
      description: editedTask.description,
      priority: editedTask.priority,
      status: editedTask.status,
      category: editedTask.category,
      // Format the date properly if it exists, or set to null if it doesn't
      dueDate: editedTask.dueDate
        ? editedTask.dueDate.includes("T")
          ? editedTask.dueDate
          : `${editedTask.dueDate}T00:00:00.000Z`
        : null,
    };

    setIsSaving(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskToUpdate),
      });

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updatedTask = await response.json();
        setTask(updatedTask);
        setEditedTask(updatedTask);
        setIsEditing(false);
        showToast("✅ Task updated successfully", "success");
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to update task", "error");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Error updating task", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        showToast("🗑️ Task deleted successfully", "success");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        showToast("Failed to delete task", "error");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Error deleting task", "error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="flex justify-center items-center h-full gap-2">
          <span className="text-gray-600">Loading session</span>
          <PulseLoader
            color="#4B5563"
            loading={true}
            size={4}
            speedMultiplier={0.8}
            aria-label="Loading Session"
          />
        </div>
      );
    }

    if (status === "unauthenticated") {
      return (
        <div className="flex justify-center items-center h-full">
          Please sign in to view this task.
        </div>
      );
    }

    if (!task) {
      return (
        <div className="flex justify-center items-center h-full gap-2">
          <span className="text-gray-600">Loading task</span>
          <PulseLoader
            color="#4B5563"
            loading={true}
            size={4}
            speedMultiplier={0.8}
            aria-label="Loading Task"
          />
        </div>
      );
    }

    return (
      <div className="bg-white shadow-lg rounded-lg max-w-xl mx-auto flex flex-col">
        <div className="flex flex-col p-5 h-full">
          {/* Header Section with Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
            <div className="flex items-start w-full overflow-hidden sm:w-auto sm:max-w-[75%]">
              <ClipboardDocumentListIcon className="h-6 w-6 text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
              {isEditing ? (
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={editedTask?.title || ""}
                    onChange={handleTitleChange}
                    className="w-full py-0.5 px-2 border rounded text-base font-medium focus:outline-none focus:border-gray-400 transition-colors"
                    maxLength={MAX_TITLE_LENGTH}
                  />
                  <div className="flex justify-end mt-1">
                    <span
                      className={`text-xs ${
                        (editedTask?.title?.length || 0) >= MAX_TITLE_LENGTH
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {editedTask?.title?.length || 0}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>
                </div>
              ) : (
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 break-words hyphens-auto w-full overflow-hidden pr-2">
                  {task.title}
                </h1>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 flex-shrink-0 self-end sm:self-start">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 text-sm transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <PulseLoader color="#ffffff" size={8} margin={4} />
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTask(task);
                    }}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors group"
                    title="Edit task"
                  >
                    <PencilIcon className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors group"
                    title="Delete task"
                  >
                    <TrashIcon className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Description Section - with character limit */}
          <div className="mb-4 flex-grow overflow-hidden">
            {isEditing ? (
              <div className="space-y-1 h-full flex flex-col">
                <textarea
                  value={editedTask?.description || ""}
                  onChange={handleDescriptionChange}
                  className="w-full p-2.5 border rounded resize-vertical flex-grow"
                  rows={5}
                  placeholder="Add a description..."
                  maxLength={MAX_CHARS}
                />
                <div className="flex justify-end">
                  <span
                    className={`text-xs ${
                      charCount >= MAX_CHARS ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {charCount}/{MAX_CHARS} characters
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 whitespace-pre-wrap break-words overflow-auto max-h-[250px] min-h-[60px]">
                {task.description || "No description"}
              </div>
            )}
          </div>

          {/* Details Grid - Responsive grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center p-2.5 bg-gray-50 rounded-lg">
              <CalendarIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Due Date</span>
                <span className="text-sm font-medium">
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        editedTask?.dueDate
                          ? editedTask.dueDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask!,
                          dueDate: e.target.value || null,
                        })
                      }
                      className="p-1 border rounded text-sm"
                    />
                  ) : task.dueDate ? (
                    format(new Date(task.dueDate), "EEE, MMM d, yyyy")
                  ) : (
                    "Not set"
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center p-2.5 bg-gray-50 rounded-lg">
              <FlagIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Priority</span>
                <span className="text-sm font-medium">
                  {isEditing ? (
                    <select
                      value={editedTask?.priority || ""}
                      onChange={(e) => {
                        // Convert empty string to null, otherwise use the value as a valid priority
                        const priorityValue =
                          e.target.value === ""
                            ? null
                            : (e.target.value as "High" | "Medium" | "Low");

                        setEditedTask({
                          ...editedTask!,
                          priority: priorityValue,
                        });
                      }}
                      className="p-1 border rounded text-sm"
                    >
                      <option value="">Not set</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  ) : (
                    task.priority || "Not set"
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center p-2.5 bg-gray-50 rounded-lg">
              <ArrowPathIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Status</span>
                <span className="text-sm font-medium">
                  {isEditing ? (
                    <select
                      value={editedTask?.status || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask!,
                          status: e.target.value,
                        })
                      }
                      className="p-1 border rounded text-sm"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-2 py-0.5 text-sm rounded ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : task.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center p-2.5 bg-gray-50 rounded-lg">
              <TagIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Category</span>
                <span className="text-sm font-medium">
                  {isEditing ? (
                    <select
                      value={editedTask?.category || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask!,
                          category: e.target.value || null,
                        })
                      }
                      className="p-1 border rounded text-sm"
                    >
                      <option value="">Select category</option>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Study">Study</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Home">Home</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    task.category || "None"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="flex items-center text-xs text-gray-500">
                  <ClockIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  Created: {formatRelativeTime(task.createdAt)}
                </p>
                <p className="flex items-center text-xs text-gray-500">
                  <PencilSquareIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                  Last edited:{" "}
                  {formatRelativeTime(task.lastEditedAt || task.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleBackNavigation = () => {
    switch (source) {
      case "tasks":
        router.push("/tasks");
        break;
      case "dashboard":
      default:
        router.push("/dashboard");
        break;
    }
  };

  const getBackNavigationText = () => {
    switch (source) {
      case "tasks":
        return "Back to Tasks";
      case "dashboard":
      default:
        return "Back to Dashboard";
    }
  };

  return (
    <SidebarLayout tasks={tasks} activeTaskId={id} isAddTaskPage={false}>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 pt-6">
        {/* Navigation Header with Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackNavigation}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLongLeftIcon className="h-6 w-6 mr-2" />
              <span className="text-sm font-medium">
                {getBackNavigationText()}
              </span>
            </button>
            <nav className="hidden sm:flex items-center">
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-400 text-sm">
                Tasks / {displayTitle}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        {renderContent()}

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

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isDeleting}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="mb-4">
                Are you sure you want to delete task{" "}
                <span className="font-bold truncate block max-w-full">
                  "
                  {task?.title && task.title.length > 40
                    ? task.title.substring(0, 40) + "..."
                    : task?.title}
                  "
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <PulseLoader color="#ffffff" size={8} margin={4} />
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
