// src/app/_components/TodayTasks.tsx
import React from "react";
import Link from "next/link";
import {
  format,
  isToday,
  isBefore,
  isTomorrow,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: "High" | "Medium" | "Low" | null;
  dueDate: string | null;
  category: string | null;
}

interface TodayTasksProps {
  tasks: Task[];
  isLoading?: boolean;
}

interface CounterBadgeProps {
  count: number;
  isOverdue?: boolean;
}

const TodayTasks: React.FC<TodayTasksProps> = ({
  tasks,
  isLoading = false,
}) => {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // Tasks due today that aren't completed
  const dueTodayTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      isToday(new Date(task.dueDate)) &&
      task.status !== "Completed"
  );

  // Tasks due tomorrow that aren't completed
  const dueTomorrowTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      isTomorrow(new Date(task.dueDate)) &&
      task.status !== "Completed"
  );

  // Tasks completed today (regardless of due date)
  const completedTodayTasks = tasks.filter((task) => {
    if (task.status !== "Completed") return false;
    const taskDate = new Date(task.dueDate as string);
    return isToday(taskDate);
  });

  // Overdue tasks (due date is in the past and not completed)
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      isBefore(new Date(task.dueDate), todayStart) &&
      task.status !== "Completed"
  );

  // Format relative time - adjusted for due dates
  const formatRelativeTime = (dateString: string) => {
    // For due dates, consider end of day as the deadline
    const date = new Date(dateString);
    date.setHours(23, 59, 59); // Set to end of the due date

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    // If less than 60 minutes since end of due date
    if (diffInMinutes < 60) return "Just now";

    const diffInHours = Math.floor(diffInMinutes / 60);
    // If less than 24 hours since end of due date
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;

    return format(date, "MMM d, yyyy");
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

  // Component for consistent task counter badges
  const CounterBadge: React.FC<CounterBadgeProps> = ({
    count,
    isOverdue = false,
  }) => (
    <span
      className={`ml-1 px-1.5 py-0.5 text-xs rounded-full 
      ${isOverdue ? "text-white bg-red-500" : "text-white bg-gray-500"}`}
    >
      {count}
    </span>
  );

  // Task skeleton item component
  const TaskSkeleton = () => (
    <div className="flex items-center gap-1 py-2 px-1 animate-pulse">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mr-1.5 flex-shrink-0"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    </div>
  );

  // Also add proper typing to the TaskCounter component
  interface TaskCounterProps {
    count: number;
    title: string;
    icon: React.ElementType;
    variant: string;
    tasks: Task[];
    isLoading: boolean;
  }

  const TaskCounter: React.FC<TaskCounterProps> = ({
    count,
    title,
    icon: Icon,
    variant,
    tasks,
    isLoading,
  }) => (
    <div className="flex-1 p-3 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${
            variant === "overdue" ? "text-red-500" : "text-gray-500"
          }`}
        />
        <h3 className="text-base font-medium text-gray-900 flex items-center truncate">
          <span className="truncate">{title}</span>
          {!isLoading && count > 0 && (
            <CounterBadge count={count} isOverdue={variant === "overdue"} />
          )}
        </h3>
      </div>
      <div className="space-y-1 overflow-hidden min-h-[80px]">
        {isLoading ? (
          <>
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </>
        ) : count === 0 ? (
          <p className="text-sm text-gray-500 italic">
            {variant === "overdue"
              ? "No overdue tasks - you're all caught up! 👍"
              : variant === "completed"
              ? "No completed tasks yet today. Keep going!"
              : variant === "tomorrow"
              ? "Nothing due tomorrow. Plan ahead!"
              : "Nothing due today. Take a breather! 😌"}
          </p>
        ) : (
          tasks.slice(0, 3).map((task: Task) => (
            <Link
              key={task.id}
              href={`/task/${task.id}?source=dashboard`}
              onClick={() => handleTaskView(task.id)}
              className="block text-sm text-gray-600 hover:text-gray-900"
            >
              <div className="flex justify-between items-center gap-1 overflow-hidden">
                <div className="flex items-center min-w-0 overflow-hidden flex-grow">
                  {variant === "overdue" ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 flex-shrink-0" />
                  ) : (
                    <span className="mr-1 flex-shrink-0">•</span>
                  )}
                  <span
                    className={`truncate block w-full min-w-0 pr-1
                      ${
                        variant === "overdue"
                          ? "max-w-[165px] sm:max-w-[120px] md:max-w-[180px] lg:max-w-[200px] xl:max-w-[250px]"
                          : "max-w-[200px] sm:max-w-[120px] md:max-w-[180px] lg:max-w-[200px] xl:max-w-[250px]"
                      }`}
                    title={task.title}
                  >
                    {task.title}
                  </span>
                </div>
                {variant === "overdue" && task.dueDate && (
                  <span className="text-xs text-red-500 whitespace-nowrap flex-shrink-0 ml-1">
                    {formatRelativeTime(task.dueDate)}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
        {!isLoading && count > 3 && (
          <p className="text-sm text-gray-500">+{count - 3} more</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-2 flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
      <TaskCounter
        count={overdueTasks.length}
        title="Overdue"
        icon={ExclamationCircleIcon}
        variant="overdue"
        tasks={overdueTasks}
        isLoading={isLoading}
      />
      <TaskCounter
        count={dueTodayTasks.length}
        title="Due Today"
        icon={ClipboardDocumentListIcon}
        variant="today"
        tasks={dueTodayTasks}
        isLoading={isLoading}
      />
      <TaskCounter
        count={dueTomorrowTasks.length}
        title="Due Tomorrow"
        icon={CalendarIcon}
        variant="tomorrow"
        tasks={dueTomorrowTasks}
        isLoading={isLoading}
      />
      <TaskCounter
        count={completedTodayTasks.length}
        title="Completed Today"
        icon={ClipboardDocumentCheckIcon}
        variant="completed"
        tasks={completedTodayTasks}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TodayTasks;
