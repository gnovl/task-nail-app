// src/app/_components/tasks/TasksHeader.tsx
// Focus on fixing the positioning of the hamburger and mobile toggle menus

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Columns,
  SlidersHorizontal,
  ArrowUpDown,
  Trash,
  Menu,
} from "lucide-react";
import { FilterOption, SortOption } from "./TasksTypes";

interface TasksHeaderProps {
  selectionMode: boolean;
  selectedTasks: string[];
  viewMode: "grid" | "list";
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showSorts: boolean;
  setShowSorts: (show: boolean) => void;
  currentFilter: FilterOption;
  setCurrentFilter: (filter: FilterOption) => void;
  currentSort: SortOption | null;
  setCurrentSort: (sort: SortOption | null) => void;
  toggleViewMode: () => void;
  setSelectionMode: (mode: boolean) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  openDeleteModal: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  selectionMode,
  selectedTasks,
  viewMode,
  showFilters,
  setShowFilters,
  showSorts,
  setShowSorts,
  currentFilter,
  currentSort,
  toggleViewMode,
  setSelectionMode,
  selectAllTasks,
  clearSelection,
  openDeleteModal,
}) => {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  return (
    <div className="sticky top-0 z-40 bg-white py-3 border-b border-gray-200 shadow-sm w-full mt-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4">
          {/* Top Row with Action Buttons */}
          <div className="flex items-center justify-between w-full">
            {/* Hamburger menu is handled by SidebarLayout component */}
            <div className="sm:block">
              {/* Back button - visible only on desktop */}
              <button
                onClick={() => router.push("/dashboard")}
                className="hidden sm:flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            </div>

            {/* Selection Mode Controls - Responsive */}
            {selectionMode ? (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <div className="flex items-center bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 sm:mr-2" />
                  <span className="whitespace-nowrap">
                    {selectedTasks.length}{" "}
                    {selectedTasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={selectAllTasks}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                  >
                    All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={openDeleteModal}
                    disabled={selectedTasks.length === 0}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors text-xs sm:text-sm flex items-center gap-1
                      ${
                        selectedTasks.length === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                  >
                    <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                {/* Mobile Menu Toggle Button - positioned on the right */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-1 rounded-md bg-gray-100 text-gray-700"
                    aria-label="Toggle mobile menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>

                {/* Desktop Controls - Unchanged */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowFilters(!showFilters);
                      if (showSorts) setShowSorts(false);
                    }}
                    className={`flex items-center gap-1 px-2 py-1.5 ${
                      showFilters || currentFilter !== "all"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } rounded-md transition-colors`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="text-sm">
                      {currentFilter === "all" ? "Filter" : "Filtered"}
                    </span>
                    {currentFilter !== "all" && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-gray-800 rounded-full">
                        1
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowSorts(!showSorts);
                      if (showFilters) setShowFilters(false);
                    }}
                    className={`flex items-center gap-1 px-2 py-1.5 ${
                      showSorts || currentSort
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } rounded-md transition-colors`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="text-sm">
                      {currentSort ? "Sorted" : "Sort"}
                    </span>
                    {currentSort && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-gray-800 rounded-full">
                        1
                      </span>
                    )}
                  </button>

                  <button
                    onClick={toggleViewMode}
                    className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 text-gray-700"
                    title={`Switch to ${
                      viewMode === "grid" ? "list" : "grid"
                    } view`}
                  >
                    <Columns className="w-4 h-4" />
                    <span className="text-sm">
                      {viewMode === "grid" ? "List" : "Grid"}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectionMode(true)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Select Tasks
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu - Shown only on small screens */}
          {showMobileMenu && !selectionMode && (
            <div className="sm:hidden flex flex-wrap gap-2 pt-1 pb-1">
              <button
                onClick={() => {
                  setShowFilters(!showFilters);
                  setShowMobileMenu(false);
                  if (showSorts) setShowSorts(false);
                }}
                className={`flex items-center gap-1 px-2 py-1.5 ${
                  showFilters || currentFilter !== "all"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } rounded-md transition-colors text-xs`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{currentFilter === "all" ? "Filter" : "Filtered"}</span>
                {currentFilter !== "all" && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-gray-800 rounded-full">
                    1
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowSorts(!showSorts);
                  setShowMobileMenu(false);
                  if (showFilters) setShowFilters(false);
                }}
                className={`flex items-center gap-1 px-2 py-1.5 ${
                  showSorts || currentSort
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } rounded-md transition-colors text-xs`}
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>{currentSort ? "Sorted" : "Sort"}</span>
                {currentSort && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-gray-800 rounded-full">
                    1
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  toggleViewMode();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-xs text-gray-700"
                title={`Switch to ${
                  viewMode === "grid" ? "list" : "grid"
                } view`}
              >
                <Columns className="w-3 h-3" />
                <span>{viewMode === "grid" ? "List" : "Grid"}</span>
              </button>

              <button
                onClick={() => {
                  setSelectionMode(true);
                  setShowMobileMenu(false);
                }}
                className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs"
              >
                <Check className="w-3 h-3" />
                Select
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksHeader;
