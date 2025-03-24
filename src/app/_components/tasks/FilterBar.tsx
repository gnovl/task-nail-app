import { useState } from "react";
import {
  FilterOption,
  SortOption,
  FilterOptionType,
  SortOptionType,
} from "./TasksTypes";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

interface FilterChipProps {
  option: FilterOption;
  label: string;
  icon: React.ReactNode;
  currentFilter: FilterOption;
  onClick: (selected: FilterOption) => void;
  count?: number;
}

interface SortChipProps {
  option: SortOption;
  label: string;
  icon: React.ReactNode;
  currentSort: SortOption | null;
  onClick: (option: SortOption) => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  option,
  label,
  icon,
  currentFilter,
  onClick,
  count,
}) => (
  <button
    onClick={() => onClick(option)}
    className={`flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium mr-1 sm:mr-2 ${
      currentFilter === option
        ? "bg-gray-700 text-white"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    } transition-colors`}
  >
    {icon}
    <span className="ml-1">{label}</span>
    {count !== undefined && count > 0 && (
      <span
        className={`ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 text-xs rounded-full ${
          currentFilter === option
            ? "bg-white text-gray-800"
            : "bg-gray-500 text-white"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

export const SortChip: React.FC<SortChipProps> = ({
  option,
  label,
  icon,
  currentSort,
  onClick,
}) => {
  // Custom logic for title sort direction
  const [titleSortDirection, setTitleSortDirection] = useState<"asc" | "desc">(
    "asc"
  );

  const handleSortClick = () => {
    if (option === "title" && currentSort === "title") {
      // Toggle sort direction when clicking title sort again
      const newDirection = titleSortDirection === "asc" ? "desc" : "asc";
      setTitleSortDirection(newDirection);
    }
    onClick(option);
  };

  return (
    <button
      onClick={handleSortClick}
      className={`flex items-center gap-1 px-2 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors
      ${
        currentSort === option
          ? "bg-gray-700 text-white"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {icon}
      <span className="truncate max-w-[60px] sm:max-w-none">
        {label}
        {option === "title" && currentSort === "title" && (
          <span className="ml-1 text-[10px] sm:text-xs">
            ({titleSortDirection === "asc" ? "A-Z" : "Z-A"})
          </span>
        )}
      </span>
      {currentSort === option && (
        <X
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 cursor-pointer text-white"
          onClick={(e) => {
            e.stopPropagation();
            onClick(null as unknown as SortOption);
          }}
        />
      )}
    </button>
  );
};

interface FilterBarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showSorts: boolean;
  setShowSorts: (show: boolean) => void;
  currentFilter: FilterOption;
  setCurrentFilter: (filter: FilterOption) => void;
  currentSort: SortOption | null;
  setCurrentSort: (sort: SortOption | null) => void;
  titleSortDirection: "asc" | "desc";
  toggleTitleSortDirection: () => void;
  filterOptions: FilterOptionType[];
  sortOptions: SortOptionType[];
  filterCounts: Record<string, number>;
}

const FilterBar: React.FC<FilterBarProps> = ({
  showFilters,
  setShowFilters,
  showSorts,
  setShowSorts,
  currentFilter,
  setCurrentFilter,
  currentSort,
  setCurrentSort,
  filterOptions,
  sortOptions,
  filterCounts,
}) => {
  const handleSortClick = (option: SortOption) => {
    if (currentSort === option) {
      setCurrentSort(null);
    } else {
      setCurrentSort(option);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-6 mx-auto">
      <div className="flex flex-col space-y-4">
        {/* Filter Options - Collapsible */}
        {showFilters && (
          <div className="mb-3 py-2 px-2 sm:px-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-1 sm:mr-2" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                  Filter Tasks By
                </h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <FilterChip
                    key={option.key}
                    option={option.key as FilterOption}
                    label={option.label}
                    icon={<Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    currentFilter={currentFilter}
                    onClick={(selected) => {
                      setCurrentFilter(selected);
                      if (selected !== currentFilter) {
                        setShowFilters(false);
                      }
                    }}
                    count={filterCounts[option.key]}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Sort Controls - Collapsible */}
        {showSorts && (
          <div className="mb-3 py-2 px-2 sm:px-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-1 sm:mr-2" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">
                  Sort Tasks By
                </h3>
              </div>
              <button
                onClick={() => setShowSorts(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SortChip
                    key={option.key}
                    option={option.key as SortOption}
                    label={option.label}
                    icon={<Icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                    currentSort={currentSort}
                    onClick={(selected) => {
                      handleSortClick(selected);
                      if (currentSort !== option.key) {
                        setShowSorts(false);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
