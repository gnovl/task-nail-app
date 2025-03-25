// src/app/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import SidebarLayout from "@/app/_components/SidebarLayout";
import { PulseLoader } from "react-spinners";
import { ArrowLeft } from "lucide-react";

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

interface User {
  name: string;
  email: string;
  createdAt: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session?.user?.email]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
  }, []);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showToast("Please type DELETE to confirm", "error");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", { method: "DELETE" });

      if (response.ok) {
        showToast("Account deleted successfully", "success");
        // Increase the delay to 2 seconds to show the toast clearly
        setTimeout(async () => {
          showToast("Logging out...", "success");
          // Add another short delay for the logout message
          setTimeout(async () => {
            await signOut({ callbackUrl: "/" });
          }, 1500);
        }, 2000);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to delete account", "error");
        setIsDeleting(false);
      }
    } catch (error) {
      showToast("An error occurred while deleting the account", "error");
      setIsDeleting(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedUser.name,
            email: updatedUser.email,
          },
        });
        showToast("✅ Profile updated successfully", "success");
        router.refresh();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to update profile", "error");
      }
    } catch (error) {
      showToast("An error occurred while updating the profile", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SidebarLayout tasks={tasks} activeTaskId="">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Navigation Header with Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 mr-2" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>

        <h1 className="text-lg font-medium text-gray-900 mb-6">
          Account Settings
        </h1>

        {/* Profile Settings Section */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Profile Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            {isLoading ? (
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <PulseLoader color="#6B7280" size={4} margin={2} />
                  <span className="text-sm">Loading account info...</span>
                </div>
              </div>
            ) : (
              userData?.createdAt && (
                <div className="border-t pt-3">
                  <label className="block text-sm text-gray-500">
                    Account Created
                  </label>
                  <p className="text-sm text-gray-600">
                    {new Date(userData.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex justify-center py-2 px-3 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Delete Account Section - Updated with less intense styling */}
        <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-300">
          <h2 className="text-base font-medium text-gray-900 mb-3">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Please type <span className="font-medium">DELETE</span> to
                confirm
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                placeholder="Type DELETE"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-3 py-2 text-sm font-medium bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-4 py-2 rounded-md shadow-sm ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            } flex items-center space-x-2 min-w-[300px]`}
          >
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
