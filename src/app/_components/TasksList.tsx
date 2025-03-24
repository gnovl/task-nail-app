"use client";
import React, { useState } from "react";
import { PulseLoader } from "react-spinners";
import { X } from "lucide-react"; // Import X icon from lucide-react
import {
  Task,
  FilterOption,
  SortOption,
  filterOptions,
  sortOptions,
} from "./tasks/TasksTypes";
import { useTasks, useTaskFiltering, useTaskSelection } from "./tasks/useTasks";
import TaskItem from "./tasks/TaskItem";
import FilterBar from "./tasks/FilterBar";
import DeleteConfirmationModal from "./tasks/DeleteConfirmationModal";
import EmptyState from "./tasks/EmptyState";
import TasksHeader from "./tasks/TasksHeader";
import ToastNotification from "./tasks/ToastNotification";
import BackToTop from "./BackToTop";

interface TasksComponentProps {
  initialTasks: Task[];
}

const TasksComponent: React.FC<TasksComponentProps> = ({ initialTasks }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showSorts, setShowSorts] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom hooks
  const {
    tasks,
    loading,
    filteredTasks,
    setFilteredTasks,
    toast,
    fetchTasks,
    showToast,
    deleteTask,
    handlePinTask,
    handleTaskView,
    deleteMultipleTasks,
    handleCompleteTask,
  } = useTasks(initialTasks);

  const {
    filteredTasks: filteredTasksFromHook,
    currentFilter,
    setCurrentFilter,
    currentSort,
    setCurrentSort,
    titleSortDirection,
    toggleTitleSortDirection,
    getFilterCounts,
    getEmptyStateMessage,
  } = useTaskFiltering(tasks);

  const {
    selectedTasks,
    setSelectedTasks,
    selectionMode,
    setSelectionMode,
    tasksToDelete,
    setTasksToDelete,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    toggleTaskSelection,
    selectAllTasks: selectAllTasksFromHook,
    openDeleteModal,
    closeDeleteModal,
  } = useTaskSelection();

  // Update filteredTasks from the filtering hook
  React.useEffect(() => {
    setFilteredTasks(filteredTasksFromHook);
  }, [filteredTasksFromHook, setFilteredTasks]);

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const handleDeleteTask = (taskId: string) => {
    setTasksToDelete([taskId]);
    setIsDeleteModalOpen(true);
  };

  const selectAllTasks = () => {
    selectAllTasksFromHook(filteredTasks.map((task) => task.id));
  };

  const clearSelection = () => {
    setSelectionMode(false);
    setSelectedTasks([]);
  };

  const resetFilters = () => {
    setCurrentFilter("all");
    setCurrentSort(null);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMultipleTasks(tasksToDelete);
      setSelectedTasks([]);
      setSelectionMode(false);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const filterCounts = getFilterCounts();

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
    <>
      {/* Consolidated Header with all controls */}
      <TasksHeader
        selectionMode={selectionMode}
        selectedTasks={selectedTasks}
        viewMode={viewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        showSorts={showSorts}
        setShowSorts={setShowSorts}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        currentSort={currentSort}
        setCurrentSort={setCurrentSort}
        toggleViewMode={toggleViewMode}
        setSelectionMode={setSelectionMode}
        selectAllTasks={selectAllTasks}
        clearSelection={clearSelection}
        openDeleteModal={openDeleteModal}
      />

      <div className="container mx-auto px-4 py-2 relative">
        {/* Filter and Sort expanded sections */}
        {(showFilters || showSorts) && (
          <FilterBar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            showSorts={showSorts}
            setShowSorts={setShowSorts}
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            currentSort={currentSort}
            setCurrentSort={setCurrentSort}
            titleSortDirection={titleSortDirection}
            toggleTitleSortDirection={toggleTitleSortDirection}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
            filterCounts={filterCounts}
          />
        )}

        {/* Current Filters/Sorts Display - When collapsed */}
        {(currentFilter !== "all" || currentSort) &&
          !showFilters &&
          !showSorts && (
            <div className="bg-white rounded-lg shadow-sm p-3 mb-6 mx-auto">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span>Active:</span>
                {currentFilter !== "all" && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                    {(() => {
                      const option = filterOptions.find(
                        (opt) => opt.key === currentFilter
                      );
                      if (!option) return null;
                      const Icon = option.icon;
                      return (
                        <>
                          <Icon className="w-3.5 h-3.5 text-gray-600" />
                          <span>Filtered by: {option.label}</span>
                          <X
                            className="w-3.5 h-3.5 text-gray-500 cursor-pointer"
                            onClick={() => setCurrentFilter("all")}
                          />
                        </>
                      );
                    })()}
                  </div>
                )}
                {currentSort && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                    {(() => {
                      const option = sortOptions.find(
                        (opt) => opt.key === currentSort
                      );
                      if (!option) return null;
                      const Icon = option.icon;
                      return (
                        <>
                          <Icon className="w-3.5 h-3.5 text-gray-600" />
                          <span>Sorted by: {option.label}</span>
                          <X
                            className="w-3.5 h-3.5 text-gray-500 cursor-pointer"
                            onClick={() => setCurrentSort(null)}
                          />
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Tasks List or Empty States */}
        {filteredTasks.length > 0 ? (
          <div
            className={`grid gap-4 mx-auto ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-6xl"
                : "grid-cols-1 max-w-3xl"
            }`}
          >
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                viewMode={viewMode}
                selectionMode={selectionMode}
                selectedTasks={selectedTasks}
                currentFilter={currentFilter}
                currentSort={currentSort}
                titleSortDirection={titleSortDirection}
                toggleTaskSelection={toggleTaskSelection}
                handleTaskView={handleTaskView}
                handlePinTask={handlePinTask}
                handleDeleteTask={handleDeleteTask}
                handleCompleteTask={handleCompleteTask}
              />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <EmptyState
            message={getEmptyStateMessage()}
            hasTasks={tasks.length > 0}
            resetFilters={resetFilters}
          />
        ) : (
          <EmptyState
            message="No tasks yet! Let's get started!"
            hasTasks={false}
            resetFilters={resetFilters}
          />
        )}

        {/* BackToTop */}
        <BackToTop />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          tasksToDelete={tasksToDelete}
          onConfirmDelete={confirmDelete}
          isDeleting={isDeleting}
          tasks={tasks}
        />

        {/* Toast Notification */}
        <ToastNotification toast={toast} />
      </div>
    </>
  );
};

export default TasksComponent;
