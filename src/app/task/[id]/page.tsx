"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SidebarLayout from "../../_components/SidebarLayout";
import {
  CalendarIcon,
  FlagIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  XMarkIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  priority: string | null;
  status: string;
  tags: string | null;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetchTasks();
    if (id) {
      fetchTask();
    }
  }, [id]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
  };

  const handleUpdate = async () => {
    if (!editedTask) return;

    // We don't need to check the due date here anymore
    // The server will handle all the date logic

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTask),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTask(updatedTask);
        setIsEditing(false);
        showToast("Task updated successfully", "success");
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to update task", "error");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast("Error updating task", "error");
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Task deleted successfully", "success");
        setTimeout(() => router.push("/new"), 2000);
      } else {
        showToast("Failed to delete task", "error");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast("Error deleting task", "error");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="flex justify-center items-center h-full">
          Loading session...
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
        <div className="flex justify-center items-center h-full">
          Loading task...
        </div>
      );
    }

    return (
      <div className="bg-white shadow-lg rounded-lg p-6 relative">
        <div className="flex items-center mb-4">
          <ClipboardDocumentListIcon className="h-8 w-8 text-gray-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? (
              <input
                type="text"
                value={editedTask?.title || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask!, title: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            ) : (
              task.title
            )}
          </h1>
        </div>
        <p className="text-lg text-gray-600 whitespace-pre-wrap mb-4">
          {isEditing ? (
            <textarea
              value={editedTask?.description || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask!, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows={3}
            />
          ) : (
            task.description
          )}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Due:{" "}
              {isEditing ? (
                <input
                  type="date"
                  value={
                    editedTask?.dueDate ? editedTask.dueDate.split("T")[0] : ""
                  }
                  onChange={(e) =>
                    setEditedTask({ ...editedTask!, dueDate: e.target.value })
                  }
                  className="p-1 border rounded"
                />
              ) : task.dueDate ? (
                new Date(task.dueDate).toLocaleDateString()
              ) : (
                "Not set"
              )}
            </span>
          </div>
          <div className="flex items-center">
            <FlagIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Priority:{" "}
              {isEditing ? (
                <select
                  value={editedTask?.priority || ""}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask!, priority: e.target.value })
                  }
                  className="p-1 border rounded"
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
          <div className="flex items-center">
            <ArrowPathIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              {isEditing ? (
                <select
                  value={editedTask?.status || ""}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask!, status: e.target.value })
                  }
                  className="p-1 border rounded"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              ) : (
                <span
                  className={`inline-block px-2 py-1 text-sm font-semibold rounded ${
                    task.status === "Completed"
                      ? "bg-green-200 text-green-800"
                      : task.status === "In Progress"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {task.status}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center">
            <TagIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Tags:{" "}
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask?.tags || ""}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask!, tags: e.target.value })
                  }
                  className="p-1 border rounded"
                />
              ) : (
                task.tags || "None"
              )}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <p className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Created: {new Date(task.createdAt).toLocaleString()}
          </p>
          <p className="flex items-center">
            <PencilSquareIcon className="h-5 w-5 mr-2" />
            Last modified: {new Date(task.updatedAt).toLocaleString()}
          </p>
        </div>
        {isEditing && (
          <div className="mt-4">
            <button
              onClick={handleUpdate}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedTask(task);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200"
            title="Update task"
          >
            <PencilIcon className="h-5 w-5 text-blue-500" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
            title="Delete task"
          >
            <TrashIcon className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <SidebarLayout tasks={tasks} activeTaskId={id} isAddTaskPage={false}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-out">
          <div
            className={`px-4 py-2 rounded shadow-lg ${
              toast.type === "success"
                ? "bg-blue-900 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      {renderContent()}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-4">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
