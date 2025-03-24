// src/app/_components/TaskListComponents.tsx
import React from "react";
import { Pin } from "lucide-react";
import {
  CalendarIcon,
  FlagIcon,
  CheckIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  TagIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ViewColumnsIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";

export type SortOption =
  | "dueDate"
  | "priority"
  | "createdAt"
  | "updatedAt"
  | "title"
  | "status"
  | "category"
  | "pinned";

export type FilterOption =
  | "all"
  | "overdue"
  | "dueToday"
  | "dueTomorrow"
  | "completed"
  | "notStarted"
  | "inProgress";

export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  priority: "Low" | "Medium" | "High" | null;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
  description: string | null;
  completed: boolean;
  status: string;
  category: string | null;
  estimatedTime: number | null;
  viewed: boolean;
  pinned: boolean;
}

export interface Toast {
  message: string;
  type: "success" | "error";
  icon?: string;
}

export const sortOptions = [
  { key: "pinned", label: "Pinned", icon: Pin },
  { key: "category", label: "Category", icon: TagIcon },
  { key: "createdAt", label: "Created Date", icon: ClockIcon },
  { key: "updatedAt", label: "Last Edited", icon: PencilIcon },
  { key: "dueDate", label: "Due Date", icon: CalendarIcon },
  { key: "priority", label: "Priority", icon: FlagIcon },
  { key: "status", label: "Status", icon: CheckCircleIcon },
  { key: "title", label: "Title", icon: ClipboardDocumentListIcon },
] as const;

export const filterOptions = [
  { key: "all", label: "All Tasks", icon: ClipboardDocumentListIcon },
  { key: "overdue", label: "Overdue", icon: ExclamationCircleIcon },
  { key: "dueToday", label: "Due Today", icon: ClockIcon },
  { key: "dueTomorrow", label: "Due Tomorrow", icon: CalendarIcon },
  { key: "completed", label: "Completed", icon: CheckCircleIcon },
  { key: "notStarted", label: "Not Started", icon: ClipboardDocumentIcon },
  { key: "inProgress", label: "In Progress", icon: ArrowPathIcon },
] as const;

export const getPriorityFlagColor = (priority: string | null) => {
  switch (priority) {
    case "High":
      return "text-red-500";
    case "Medium":
      return "text-orange-500";
    case "Low":
      return "text-green-500";
    default:
      return "text-gray-400";
  }
};

interface SortChipProps {
  option: SortOption;
  label: string;
  icon: React.ReactNode;
  currentSort: SortOption | null;
  onClick: (option: SortOption) => void;
}

interface FilterChipProps {
  option: FilterOption;
  label: string;
  icon: React.ReactNode;
  currentFilter: FilterOption;
  onClick: (option: FilterOption) => void;
  count?: number;
}

export const SortChip: React.FC<SortChipProps> = ({
  option,
  label,
  icon,
  currentSort,
  onClick,
}) => (
  <button
    onClick={() => onClick(option)}
    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2 ${
      currentSort === option
        ? "bg-blue-500 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    {icon}
    <span className="ml-1">{label}</span>
  </button>
);

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
    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium mr-2 ${
      currentFilter === option
        ? "bg-gray-700 text-white"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    } transition-colors`}
  >
    {icon}
    <span className="ml-1">{label}</span>
    {count !== undefined && count > 0 && (
      <span
        className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
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

// Function to check if a date string is valid
export const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Helper to shuffle tasks array
export const shuffleArray = (array: Task[]) => {
  return array
    .map((task) => ({ ...task, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey, ...task }) => task);
};

// Add the PencilIcon which was missing in the import
function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
      />
    </svg>
  );
}
