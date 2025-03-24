import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import PulseLoader from "react-spinners/PulseLoader";

// Constants for character limits
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 270;

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
  selectedDate?: Date | null;
}

const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState(
    selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Reset form when modal opens with a selected date
  useEffect(() => {
    if (isOpen && selectedDate) {
      // Ensure the selected date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate >= today) {
        setDueDate(format(selectedDate, "yyyy-MM-dd"));
      } else {
        setDueDate(format(today, "yyyy-MM-dd"));
      }
    }

    // Clear error when modal opens
    if (isOpen) {
      setError(null);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDueDate(selectedDate);
    setError(null); // Clear any previous error when user changes the date
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return;

    // Additional validation for the due date
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of today

      if (dueDateObj < today) {
        setError("Due date cannot be in the past");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority: priority || null,
        status,
        category: category || null,
      };

      await onSubmit(taskData);

      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("");
      setStatus("Not Started");
      setCategory("");

      onClose();
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="text-sm font-medium text-gray-700 mb-1 inline-block"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter task title"
              required
              maxLength={MAX_TITLE_LENGTH}
            />
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

          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 mb-1 inline-block"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none"
              placeholder="Add a description (optional)"
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dueDate"
                className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={handleDueDateChange}
                min={minDate}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center"
              >
                <FlagIcon className="w-4 h-4 mr-1" />
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">No Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="text-sm font-medium text-gray-700 mb-1 inline-block"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 mb-1 inline-flex items-center"
              >
                <TagIcon className="w-4 h-4 mr-1" />
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
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

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md mr-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] inline-flex items-center justify-center"
            >
              {isSubmitting ? (
                <PulseLoader color="#ffffff" size={8} margin={4} />
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickTaskModal;
