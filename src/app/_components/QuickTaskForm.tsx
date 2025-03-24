"use client";

import { useState } from "react";
import { PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

// Constants for character limits
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 270;

interface QuickTaskFormProps {
  onSubmit: (taskData: any) => Promise<void>;
  onSuccess: () => void;
}

export default function QuickTaskForm({
  onSubmit,
  onSuccess,
}: QuickTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [category, setCategory] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get minimum date value (today) for date input
  const today = new Date();
  const minDate = format(today, "yyyy-MM-dd");

  // Handle title change with character limit
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_TITLE_LENGTH) {
      setTitle(newValue);
    }
  };

  // Handle description change with character limit
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(newValue);
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDueDate(selectedDate);
    setError(null); // Clear any previous error when user changes the date
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return;

    // Validate due date is not in the past
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today

      if (dueDateObj < today) {
        setError("Due date cannot be in the past");
        return;
      }
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority: priority || null,
      status,
      category: category || null,
    };

    try {
      await onSubmit(taskData);
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("");
      setStatus("Not Started");
      setCategory("");
      setIsExpanded(false);
      setError(null);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message || "Failed to create task");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg">
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-base font-medium text-gray-900">Create Task</h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {/* Quick Add Input Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Add a new task..."
                className="w-full text-sm px-3 py-2 border rounded-md text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                maxLength={MAX_TITLE_LENGTH}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span
                className={`text-xs ${
                  title.length >= MAX_TITLE_LENGTH
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {title.length}/{MAX_TITLE_LENGTH} characters
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            title={isExpanded ? "Show less" : "Show more options"}
          >
            <ChevronDownIcon
              className={`w-5 h-5 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Add a description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    description.length >= MAX_DESCRIPTION_LENGTH
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {description.length}/{MAX_DESCRIPTION_LENGTH} characters
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  min={minDate}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="">No Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="">No Category</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Study">Study</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Home">Home</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
