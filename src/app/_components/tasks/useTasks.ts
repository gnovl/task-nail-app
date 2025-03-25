import { useState, useEffect, useCallback } from "react";
import {
  Task,
  Toast,
  FilterOption,
  SortOption,
  shuffleArray,
} from "./TasksTypes";
import { format, isToday, isTomorrow, isBefore, startOfDay } from "date-fns";

export const useTasks = (initialTasks: Task[]) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [originalOrder, setOriginalOrder] = useState<Task[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      const shuffledTasks = shuffleArray(data);
      setTasks(shuffledTasks);
      setFilteredTasks(shuffledTasks);
      setOriginalOrder(shuffledTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showToast("Failed to fetch tasks", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const showToast = (
    message: string,
    type: "success" | "error",
    icon?: string,
    undoAction?: () => void
  ) => {
    setToast({ message, type, icon, undoAction });
    // Only clear toast automatically if there's no undo action
    if (!undoAction) {
      setTimeout(() => setToast(null), 3000);
    } else {
      // For toasts with undo, we'll keep them visible longer
      setTimeout(() => setToast(null), 5000);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task ${taskId}`);
      }

      showToast(`🗑️ Task deleted successfully`, "success");
      await fetchTasks();
      return true;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      showToast(`Failed to delete task`, "error");
      return false;
    }
  };

  const handlePinTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/pin`, {
        method: "PUT",
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, pinned: updatedTask.pinned } : task
          )
        );
        showToast(
          `Task ${updatedTask.pinned ? "pinned" : "unpinned"} successfully`,
          "success",
          updatedTask.pinned ? "📌" : "📍"
        );
      }
    } catch (error) {
      console.error("Error updating pin status:", error);
      showToast("Failed to update pin status", "error", "❌");
    }
  };

  const handleTaskView = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/view`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update the local state to reflect the viewed status
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, viewed: true } : task
          )
        );
      }
    } catch (error) {
      console.error("Error marking task as viewed:", error);
    }
  };

  const handleCompleteTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const completedAt = isCompleted ? new Date().toISOString() : null;
      const status = isCompleted
        ? "Completed"
        : taskToUpdate.status === "Completed"
        ? "Not Started"
        : taskToUpdate.status;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          completedAt, // Make sure this is included
          completed: isCompleted,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();

        // Update local state with completedAt
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                  completedAt,
                  completed: isCompleted,
                }
              : task
          )
        );

        // Show toast notification with undo option
        showToast(
          `Task ${isCompleted ? "completed" : "marked as incomplete"}`,
          "success",
          isCompleted ? "✅" : "↩️",
          () => handleCompleteTask(taskId, !isCompleted) // Undo function
        );
      }
    } catch (error) {
      console.error("Error updating task completion status:", error);
      showToast("Failed to update task", "error");
    }
  };

  const deleteMultipleTasks = async (taskIds: string[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (const taskId of taskIds) {
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
      showToast(`🗑️ Successfully deleted ${successCount} task(s)`, "success");
    }
    if (errorCount > 0) {
      showToast(`Failed to delete ${errorCount} task(s)`, "error");
    }

    fetchTasks();
    return { successCount, errorCount };
  };

  return {
    tasks,
    loading,
    filteredTasks,
    setFilteredTasks,
    originalOrder,
    toast,
    fetchTasks,
    showToast,
    deleteTask,
    handlePinTask,
    handleTaskView,
    handleCompleteTask,
    deleteMultipleTasks,
  };
};

export const useTaskFiltering = (tasks: Task[]) => {
  const [currentFilter, setCurrentFilter] = useState<FilterOption>("all");
  const [currentSort, setCurrentSort] = useState<SortOption | null>(null);
  const [titleSortDirection, setTitleSortDirection] = useState<"asc" | "desc">(
    "asc"
  );
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Toggle title sort direction
  const toggleTitleSortDirection = () => {
    setTitleSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const applyFilters = useCallback(
    (tasksToFilter: Task[]) => {
      const today = new Date();
      const todayStart = startOfDay(today);

      switch (currentFilter) {
        case "overdue":
          return tasksToFilter.filter(
            (task) =>
              task.dueDate &&
              isBefore(new Date(task.dueDate), todayStart) &&
              task.status !== "Completed"
          );
        case "dueToday":
          return tasksToFilter.filter(
            (task) =>
              task.dueDate &&
              isToday(new Date(task.dueDate)) &&
              task.status !== "Completed"
          );
        case "dueTomorrow":
          return tasksToFilter.filter(
            (task) =>
              task.dueDate &&
              isTomorrow(new Date(task.dueDate)) &&
              task.status !== "Completed"
          );
        case "completed":
          return tasksToFilter.filter((task) => task.status === "Completed");
        case "notStarted":
          return tasksToFilter.filter((task) => task.status === "Not Started");
        case "inProgress":
          return tasksToFilter.filter((task) => task.status === "In Progress");
        case "all":
        default:
          return tasksToFilter;
      }
    },
    [currentFilter]
  );

  const sortTasks = useCallback(
    (tasksToSort: Task[], option: SortOption) => {
      return [...tasksToSort].sort((a, b) => {
        switch (option) {
          case "pinned":
            return a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1;
          case "dueDate":
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
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
            const bDate = b.lastEditedAt
              ? new Date(b.lastEditedAt)
              : new Date(b.updatedAt);
            const aDate = a.lastEditedAt
              ? new Date(a.lastEditedAt)
              : new Date(a.updatedAt);
            return bDate.getTime() - aDate.getTime();
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
            // Apply sort direction
            return titleSortDirection === "asc"
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          case "category":
            if (!a.category && !b.category) return 0;
            if (!a.category) return 1;
            if (!b.category) return -1;
            return a.category.localeCompare(b.category);
          default:
            return 0;
        }
      });
    },
    [titleSortDirection]
  );

  useEffect(() => {
    let result = applyFilters([...tasks]);

    if (currentSort === "pinned") {
      const hasPinnedTasks = result.some((task) => task.pinned);
      if (hasPinnedTasks) {
        result = result.sort((a, b) =>
          a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
        );
      } else {
        result = [];
      }
    } else if (currentSort) {
      result = sortTasks(result, currentSort);
    }

    if (currentSort === "pinned" && !tasks.some((task) => task.pinned)) {
      result = [];
    }

    setFilteredTasks(result);
  }, [
    tasks,
    currentFilter,
    currentSort,
    titleSortDirection,
    applyFilters,
    sortTasks,
  ]);

  const getFilterCounts = () => {
    const today = new Date();
    const todayStart = startOfDay(today);

    return {
      overdue: tasks.filter(
        (task) =>
          task.dueDate &&
          isBefore(new Date(task.dueDate), todayStart) &&
          task.status !== "Completed"
      ).length,
      dueToday: tasks.filter(
        (task) =>
          task.dueDate &&
          isToday(new Date(task.dueDate)) &&
          task.status !== "Completed"
      ).length,
      dueTomorrow: tasks.filter(
        (task) =>
          task.dueDate &&
          isTomorrow(new Date(task.dueDate)) &&
          task.status !== "Completed"
      ).length,
      completed: tasks.filter((task) => task.status === "Completed").length,
      notStarted: tasks.filter((task) => task.status === "Not Started").length,
      inProgress: tasks.filter((task) => task.status === "In Progress").length,
      all: tasks.length,
    };
  };

  const getEmptyStateMessage = () => {
    if (currentSort === "pinned") {
      const hasPinnedTasks = tasks.some((task) => task.pinned);
      if (!hasPinnedTasks) {
        return "No pinned tasks found. Pin important tasks to see them here!";
      }
      return `No ${
        currentFilter !== "all" ? currentFilter : "pinned"
      } tasks found with the current filters.`;
    }

    if (currentSort && currentFilter === "all") {
      switch (currentSort) {
        case "dueDate":
          return "No tasks with due dates found. Add due dates to better organize your work!";
        case "priority":
          return "No prioritized tasks found. Set task priorities to help focus your efforts!";
        case "status":
          return "No tasks with matching status. Try a different status filter!";
        case "category":
          return "No categorized tasks found. Categorize tasks to better organize your work!";
        case "createdAt":
          return "No recently created tasks found with the current filters.";
        case "updatedAt":
          return "No recently updated tasks found with the current filters.";
        case "title":
          return "No tasks match the current sorting criteria.";
        default:
          return "No tasks match the current filters.";
      }
    }

    switch (currentFilter) {
      case "overdue":
        return "Great job! You have no overdue tasks.";
      case "dueToday":
        return "Nothing due today. Enjoy your day!";
      case "dueTomorrow":
        return "Nothing due tomorrow. Looking ahead!";
      case "completed":
        return "No completed tasks yet. Mark tasks as completed when you finish them!";
      case "notStarted":
        return "No tasks in 'Not Started' status. All your tasks are in progress or completed!";
      case "inProgress":
        return "No tasks in progress. Start working on your tasks!";
      default:
        return "No tasks match the current filters.";
    }
  };

  return {
    filteredTasks,
    currentFilter,
    setCurrentFilter,
    currentSort,
    setCurrentSort,
    titleSortDirection,
    toggleTitleSortDirection,
    applyFilters,
    sortTasks,
    getFilterCounts,
    getEmptyStateMessage,
  };
};

export const useTaskSelection = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [tasksToDelete, setTasksToDelete] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const selectAllTasks = (taskIds: string[]) => {
    setSelectedTasks(taskIds);
  };

  const openDeleteModal = () => {
    setTasksToDelete(selectedTasks);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTasksToDelete([]);
  };

  return {
    selectedTasks,
    setSelectedTasks,
    selectionMode,
    setSelectionMode,
    tasksToDelete,
    setTasksToDelete,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    toggleTaskSelection,
    selectAllTasks,
    openDeleteModal,
    closeDeleteModal,
  };
};
