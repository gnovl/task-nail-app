// src/app/_components/TaskCalendar.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Calendar } from "lucide-react";
import Link from "next/link";

import PreviewTooltip from "./PreviewTooltip";

interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "High" | "Medium" | "Low" | null;
  status: string;
  category?: string | null;
}

interface TaskCalendarProps {
  tasks: Task[];
  onClose?: () => void;
  compact?: boolean;
  isLoading?: boolean;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  onClose,
  compact = false,
  isLoading = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [showPreviewTooltip, setShowPreviewTooltip] = useState(false);

  // Add ref for the calendar container
  const calendarRef = useRef<HTMLDivElement>(null);
  // Add ref for the preview container
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handler for click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clickedDate &&
        calendarRef.current &&
        previewRef.current &&
        !previewRef.current.contains(event.target as Node) &&
        calendarRef.current.contains(event.target as Node)
      ) {
        setClickedDate(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickedDate]);

  // Show tooltip when first hovering over a date with tasks
  useEffect(() => {
    if (
      hoveredDate &&
      !clickedDate &&
      !localStorage.getItem("previewTooltipShown")
    ) {
      setShowPreviewTooltip(true);
      localStorage.setItem("previewTooltipShown", "true");
    }
  }, [hoveredDate, clickedDate]);

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) => task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  // Calculate preview position
  const getPreviewPosition = (index: number) => {
    const dayPosition = index % 7; // 0 to 6, representing Sunday to Saturday
    const weekRow = Math.floor(index / 7); // 0 to 4/5, representing the week
    const isLastTwoColumns = dayPosition >= 5; // Friday or Saturday
    const isFirstTwoColumns = dayPosition <= 1; // Sunday or Monday
    const isFirstRow = weekRow === 0;
    const isLastRow = weekRow >= 4; // Assuming a standard month view

    if (isLastTwoColumns) {
      // For dates in the last two columns (Fri, Sat), show preview on the left
      return "right-full mr-2";
    }

    if (isFirstTwoColumns) {
      // For dates in the first two columns (Sun, Mon), show preview on the right
      return "left-full ml-2";
    }

    if (isFirstRow) {
      return "top-full mt-2"; // Show below for first row
    }

    if (isLastRow) {
      return "bottom-full mb-2"; // Show above for last row
    }

    // Default position (show above the date)
    return "bottom-full mb-2";
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length > 0) {
      setClickedDate(clickedDate && isSameDay(clickedDate, date) ? null : date);
      setHoveredDate(null);
    }
  };

  const handleTaskView = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/view`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Error marking task as viewed:", error);
    }
  };

  // Calendar day skeleton
  const CalendarSkeleton = () => (
    <div className="grid grid-cols-7 gap-1">
      {Array(7)
        .fill(0)
        .map((_, dayIndex) => (
          <div
            key={`day-label-${dayIndex}`}
            className="text-center text-sm font-medium text-gray-300 py-1 animate-pulse"
          >
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dayIndex]}
          </div>
        ))}

      {Array(35)
        .fill(0)
        .map((_, i) => (
          <div
            key={`day-cell-${i}`}
            className="p-1 text-center min-h-[2.5rem] flex flex-col items-center justify-center animate-pulse"
          >
            <div className="h-6 w-6 bg-gray-200 rounded-full mb-0.5"></div>
            {i % 4 === 0 && (
              <div className="flex gap-0.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
              </div>
            )}
          </div>
        ))}
    </div>
  );

  return (
    <div
      className={`bg-white rounded-lg ${
        !compact && "shadow-lg border border-gray-200"
      } w-full ${compact ? "max-w-full" : "max-w-[350px]"}`}
    >
      {/* Calendar Header */}
      <div
        className={`flex items-center justify-between ${
          compact ? "pb-2" : "p-3 border-b border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-medium text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-100 rounded"
            disabled={isLoading}
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className={compact ? "p-2" : "p-3"} ref={calendarRef}>
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <>
            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((date, index) => {
                const dayTasks = getTasksForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);
                const hasTasksForDay = dayTasks.length > 0;
                const isSelected = clickedDate
                  ? isSameDay(date, clickedDate)
                  : false;

                // Only show cursor pointer if the day has tasks
                const showCursorPointer = hasTasksForDay;

                return (
                  <div
                    key={date.toISOString()}
                    className={`relative ${
                      compact ? "p-0.5" : "p-1"
                    } text-center ${
                      compact ? "min-h-[1.75rem]" : "min-h-[2.5rem]"
                    } flex flex-col items-center justify-center
                ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                ${showCursorPointer ? "cursor-pointer hover:bg-gray-50" : ""}
                ${isSelected ? "bg-blue-50" : ""}
                transition-colors`}
                    onMouseEnter={() =>
                      !clickedDate && hasTasksForDay && setHoveredDate(date)
                    }
                    onMouseLeave={() => !clickedDate && setHoveredDate(null)}
                    onClick={() => hasTasksForDay && handleDateClick(date)}
                  >
                    <span
                      className={`text-sm ${
                        isCurrentDay
                          ? "bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-200"
                          : ""
                      }`}
                    >
                      {format(date, "d")}
                    </span>

                    {/* Task indicators */}
                    {hasTasksForDay && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`w-1 h-1 rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Task preview tooltip */}
                    {((hoveredDate && isSameDay(date, hoveredDate)) ||
                      (clickedDate && isSameDay(date, clickedDate))) &&
                      hasTasksForDay && (
                        <div
                          ref={previewRef}
                          className={`absolute z-20 ${getPreviewPosition(
                            index
                          )} 
                          bg-white rounded-lg shadow-lg p-2 w-56 text-left border border-gray-200`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between text-xs font-medium text-gray-900 mb-2 border-b pb-1">
                            <span>
                              {format(date, "MMMM d, yyyy")} • {dayTasks.length}{" "}
                              task
                              {dayTasks.length !== 1 ? "s" : ""}
                            </span>
                            {isSelected && (
                              <button
                                onClick={() => setClickedDate(null)}
                                className="p-0.5 hover:bg-gray-100 rounded-full"
                              >
                                <XMarkIcon className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-1">
                            {dayTasks.map((task) => (
                              <Link
                                key={task.id}
                                href={`/task/${task.id}`}
                                onClick={() => handleTaskView(task.id)}
                                className="flex items-center gap-2 px-1 py-0.5 hover:bg-gray-50 rounded group"
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(
                                    task.priority
                                  )}`}
                                />
                                <span
                                  className="text-xs text-gray-600 group-hover:text-gray-900 truncate flex-1"
                                  title={task.title}
                                >
                                  {task.title}
                                </span>
                                <span
                                  className={`text-xs ${
                                    task.status === "Completed"
                                      ? "text-green-600"
                                      : task.status === "In Progress"
                                      ? "text-blue-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            {/* Internal Tooltip */}
            {showPreviewTooltip && (
              <div className="px-3 py-3">
                <PreviewTooltip />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCalendar;
