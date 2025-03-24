import React from "react";
import {
  Task,
  isTaskOverdue,
  getPriorityFlagColor,
  isValidDate,
} from "./TasksTypes";
import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import { Pin, CheckIcon } from "lucide-react";
import {
  ExclamationCircleIcon,
  CalendarIcon,
  TagIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

interface TaskItemProps {
  task: Task;
  viewMode: "grid" | "list";
  selectionMode: boolean;
  selectedTasks: string[];
  currentFilter: string;
  currentSort: string | null;
  titleSortDirection?: "asc" | "desc";
  toggleTaskSelection: (taskId: string) => void;
  handleTaskView: (taskId: string) => void;
  handlePinTask: (taskId: string) => void;
  handleDeleteTask: (taskId: string) => void;
  handleCompleteTask: (taskId: string, isCompleted: boolean) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  viewMode,
  selectionMode,
  selectedTasks,
  currentFilter,
  currentSort,
  titleSortDirection,
  toggleTaskSelection,
  handleTaskView,
  handlePinTask,
  handleDeleteTask,
  handleCompleteTask,
}) => {
  const isOverdue = isTaskOverdue(task);
  const isSelected = selectedTasks.includes(task.id);

  // Format completion time if available
  const formattedCompletionTime =
    task.status === "Completed" && task.completedAt
      ? format(new Date(task.completedAt), "MMM d, yyyy • h:mm a")
      : null;

  // Helper functions for styling based on filter and sort type
  const getStatusStyles = (status: string) => {
    if (currentFilter === "notStarted" && status === "Not Started") {
      return "text-purple-600 font-medium";
    }
    if (currentFilter === "inProgress" && status === "In Progress") {
      return "text-yellow-600 font-medium";
    }
    if (currentFilter === "completed" && status === "Completed") {
      return "text-green-600 font-medium";
    }

    if (currentSort === "status") {
      return status === "Completed"
        ? "text-green-600 font-medium"
        : status === "In Progress"
        ? "text-yellow-600 font-medium"
        : "text-gray-600 font-medium";
    }

    // Add neutral styling for completed tasks when in "all" filter
    if (currentFilter === "all" && status === "Completed") {
      return "text-gray-600";
    }

    return "";
  };

  const getPriorityStyles = () => {
    return currentSort === "priority" ? "font-medium" : "";
  };

  const getCategoryStyles = () => {
    return currentSort === "category" ? "text-indigo-600 font-medium" : "";
  };

  const getDueDateStyles = () => {
    if (currentFilter === "overdue" && isOverdue) {
      return "text-red-600 font-medium";
    }
    if (currentFilter === "dueToday" && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (isToday(dueDate)) {
        return "text-orange-600 font-medium";
      }
    }
    if (currentFilter === "dueTomorrow" && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (isTomorrow(dueDate)) {
        return "text-blue-600 font-medium";
      }
    }
    return currentSort === "dueDate" ? "text-blue-600 font-medium" : "";
  };

  const getTitleStyles = () => {
    return currentSort === "title" ? "text-purple-600 font-medium" : "";
  };

  return (
    <div
      className={`bg-white shadow-md rounded-lg overflow-hidden transition-colors duration-200 ${
        viewMode === "grid"
          ? "flex flex-col p-4 pt-8"
          : "flex flex-row p-2.5 pr-1.5 items-center"
      } relative group ${
        isSelected
          ? "bg-gray-50 border-2 border-gray-400"
          : isOverdue
          ? "hover:bg-gray-100 border-l-4 border-red-500"
          : "hover:bg-gray-100"
      }`}
    >
      {/* Overdue Indicator for Grid View */}
      {isOverdue && !selectionMode && viewMode === "grid" && (
        <div className="absolute top-2 left-2 flex items-center text-xs text-red-600 font-medium">
          <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1" />
          Overdue
        </div>
      )}

      {/* Complete button (left side) for Grid view */}
      {viewMode === "grid" && !selectionMode && !isOverdue && (
        <div className="absolute top-2 left-2 flex items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCompleteTask(task.id, task.status !== "Completed");
            }}
            className={`p-1 rounded transition-colors shadow-sm ${
              task.status === "Completed"
                ? "bg-green-100 text-green-500 hover:bg-green-200 group-hover:shadow"
                : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-500 group-hover:shadow"
            }`}
            title={
              task.status === "Completed"
                ? "Mark as incomplete"
                : "Mark as complete"
            }
          >
            <CheckIcon className="w-3 h-3" />
          </button>

          {/* Move the priority flag next to the complete button */}
          <div className="ml-2 flex items-center">
            <FlagIcon
              className={`w-5 h-5 ${getPriorityFlagColor(task.priority)} ${
                currentSort === "priority" ? "animate-pulse" : ""
              }`}
              title={`Priority: ${task.priority || "None"}`}
            />
            <span
              className={`ml-1 text-xs font-medium text-gray-500 ${getPriorityStyles()}`}
            >
              {task.priority || "No priority"}
            </span>
          </div>
        </div>
      )}

      {/* Top right controls - Only for Grid view */}
      {viewMode === "grid" && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          {selectionMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleTaskSelection(task.id)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePinTask(task.id);
                }}
                className={`p-1.5 rounded-md transition-colors group visible ${
                  task.pinned
                    ? "text-blue-500 hover:text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title={task.pinned ? "Unpin task" : "Pin task"}
              >
                <Pin
                  className={`w-4 h-4 transition-transform ${
                    task.pinned ? "rotate-45" : ""
                  } ${currentSort === "pinned" ? "text-blue-600" : ""}`}
                />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                title="Delete task"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Priority flag or overdue indicator for list view */}
      {viewMode === "list" && (
        <div className="flex-shrink-0 mr-3 flex items-center">
          {selectionMode ? (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleTaskSelection(task.id)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCompleteTask(task.id, task.status !== "Completed");
                }}
                className={`p-1 rounded transition-colors mr-2 shadow-sm ${
                  task.status === "Completed"
                    ? "bg-green-100 text-green-500 hover:bg-green-200 group-hover:shadow"
                    : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-500 group-hover:shadow"
                }`}
                title={
                  task.status === "Completed"
                    ? "Mark as incomplete"
                    : "Mark as complete"
                }
              >
                <CheckIcon className="w-3 h-3" />
              </button>
              {isOverdue ? (
                <ExclamationCircleIcon
                  className="w-5 h-5 text-red-500"
                  title="Overdue task"
                />
              ) : (
                <FlagIcon
                  className={`w-5 h-5 ${getPriorityFlagColor(task.priority)} ${
                    currentSort === "priority" ? "animate-pulse" : ""
                  }`}
                  title={`Priority: ${task.priority || "None"}`}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Main content - different layout for grid vs list */}
      <div
        className={`${viewMode === "list" ? "flex-grow" : ""}`}
        onClick={() => (selectionMode ? toggleTaskSelection(task.id) : null)}
      >
        {selectionMode ? (
          viewMode === "list" ? (
            /* List view content when in selection mode */
            <div className="cursor-pointer">
              <div className="flex flex-col">
                <div
                  className={`text-sm font-medium text-gray-900 mb-1 truncate ${getTitleStyles()}`}
                  title={task.title}
                >
                  {task.title}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span className={getDueDateStyles()}>
                      {task.dueDate
                        ? format(new Date(task.dueDate), "MMM dd, yyyy")
                        : "No due date"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <TagIcon className="w-3 h-3 mr-1" />
                    <span className={getCategoryStyles()}>
                      {task.category || "No category"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    <span className={getStatusStyles(task.status)}>
                      {task.status}
                      {formattedCompletionTime && (
                        <span className="text-xs ml-1 text-gray-500">
                          ({formattedCompletionTime})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Show additional info when sorted */}
                  {currentSort === "createdAt" && (
                    <div className="flex items-center ml-0.5 text-blue-500">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      <span className="font-medium">
                        Created:{" "}
                        {isValidDate(task.createdAt)
                          ? format(new Date(task.createdAt), "MMM dd, yyyy")
                          : "Invalid date"}
                      </span>
                    </div>
                  )}

                  {currentSort === "updatedAt" && (
                    <div className="flex items-center ml-0.5 text-orange-500">
                      <PencilIcon className="w-3 h-3 mr-1" />
                      <span className="font-medium">
                        Last edited:{" "}
                        {isValidDate(task.lastEditedAt || task.updatedAt)
                          ? format(
                              new Date(task.lastEditedAt || task.updatedAt),
                              "MMM dd, yyyy"
                            )
                          : "Invalid date"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Grid view content when in selection mode */
            <div className="cursor-pointer">
              <div
                className={`text-sm font-medium text-gray-900 mb-2 mt-4 truncate ${getTitleStyles()}`}
                title={task.title}
              >
                {task.title}
              </div>

              <div className="flex flex-col space-y-2 text-gray-500 text-xs">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span className={getDueDateStyles()}>
                    Due Date:{" "}
                    {task.dueDate
                      ? format(new Date(task.dueDate), "MMM dd, yyyy")
                      : "No due date"}
                  </span>
                </div>

                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span
                    className={
                      currentSort === "createdAt"
                        ? "text-blue-500 font-medium"
                        : ""
                    }
                  >
                    Created:{" "}
                    {isValidDate(task.createdAt)
                      ? format(new Date(task.createdAt), "MMM dd, yyyy")
                      : "Invalid date"}
                  </span>
                </div>

                <div className="flex items-center">
                  <PencilIcon className="w-4 h-4 mr-1" />
                  <span
                    className={
                      currentSort === "updatedAt"
                        ? "text-orange-500 font-medium"
                        : ""
                    }
                  >
                    Last Modified:{" "}
                    {isValidDate(task.updatedAt)
                      ? format(new Date(task.updatedAt), "MMM dd, yyyy")
                      : "Invalid date"}
                  </span>
                </div>

                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  <span className={getStatusStyles(task.status)}>
                    {task.status}
                    {formattedCompletionTime && (
                      <span className="text-xs ml-1 text-gray-500">
                        ({formattedCompletionTime})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center">
                  <TagIcon className="w-4 h-4 mr-1" />
                  <span className={getCategoryStyles()}>
                    {task.category || "No category"}
                  </span>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Content when not in selection mode - Link to task */
          <Link
            href={`/task/${task.id}?source=tasks`}
            className="w-full"
            onClick={() => handleTaskView(task.id)}
          >
            {viewMode === "list" ? (
              /* List view content when not in selection mode */
              <div className="flex flex-col">
                <div
                  className={`text-sm font-medium text-gray-900 mb-1 truncate ${getTitleStyles()}`}
                  title={task.title}
                >
                  {task.title}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span className={getDueDateStyles()}>
                      {task.dueDate
                        ? format(new Date(task.dueDate), "MMM dd, yyyy")
                        : "No due date"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <TagIcon className="w-3 h-3 mr-1" />
                    <span className={getCategoryStyles()}>
                      {task.category || "No category"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    <span className={getStatusStyles(task.status)}>
                      {task.status}
                      {formattedCompletionTime && (
                        <span className="text-xs ml-1 text-gray-500">
                          ({formattedCompletionTime})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Show additional info when sorted */}
                  {currentSort === "createdAt" && (
                    <div className="flex items-center ml-0.5 text-blue-500">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      <span className="font-medium">
                        Created:{" "}
                        {isValidDate(task.createdAt)
                          ? format(new Date(task.createdAt), "MMM dd, yyyy")
                          : "Invalid date"}
                      </span>
                    </div>
                  )}

                  {currentSort === "updatedAt" && (
                    <div className="flex items-center ml-0.5 text-orange-500">
                      <PencilIcon className="w-3 h-3 mr-1" />
                      <span className="font-medium">
                        Last edited:{" "}
                        {isValidDate(task.lastEditedAt || task.updatedAt)
                          ? format(
                              new Date(task.lastEditedAt || task.updatedAt),
                              "MMM dd, yyyy"
                            )
                          : "Invalid date"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Grid view content when not in selection mode */
              <div>
                <div
                  className={`text-sm font-medium text-gray-900 mb-2 mt-4 truncate ${getTitleStyles()}`}
                  title={task.title}
                >
                  {task.title}
                </div>

                <div className="flex flex-col space-y-2 text-gray-500 text-xs">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span className={getDueDateStyles()}>
                      Due Date:{" "}
                      {task.dueDate
                        ? format(new Date(task.dueDate), "MMM dd, yyyy")
                        : "No due date"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span
                      className={
                        currentSort === "createdAt"
                          ? "text-blue-500 font-medium"
                          : ""
                      }
                    >
                      Created:{" "}
                      {isValidDate(task.createdAt)
                        ? format(new Date(task.createdAt), "MMM dd, yyyy")
                        : "Invalid date"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <PencilIcon className="w-4 h-4 mr-1" />
                    <span
                      className={
                        currentSort === "updatedAt"
                          ? "text-orange-500 font-medium"
                          : ""
                      }
                    >
                      Last Modified:{" "}
                      {isValidDate(task.updatedAt)
                        ? format(new Date(task.updatedAt), "MMM dd, yyyy")
                        : "Invalid date"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span className={getStatusStyles(task.status)}>
                      {task.status}
                      {formattedCompletionTime && (
                        <span className="text-xs ml-1 text-gray-500">
                          ({formattedCompletionTime})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <TagIcon className="w-4 h-4 mr-1" />
                    <span className={getCategoryStyles()}>
                      {task.category || "No category"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Link>
        )}
      </div>

      {/* Action buttons for list view */}
      {viewMode === "list" && !selectionMode && (
        <div className="flex items-center space-x-1.5 ml-1.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePinTask(task.id);
            }}
            className={`p-1.5 rounded-md ${
              task.pinned
                ? "text-blue-500 hover:text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title={task.pinned ? "Unpin task" : "Pin task"}
          >
            <Pin
              className={`w-4 h-4 transition-transform ${
                task.pinned ? "rotate-45" : ""
              } ${currentSort === "pinned" ? "text-blue-600" : ""}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteTask(task.id);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"
            title="Delete task"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
