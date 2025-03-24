import React from "react";
import Link from "next/link";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

interface EmptyStateProps {
  message: string;
  hasTasks: boolean;
  resetFilters: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  hasTasks,
  resetFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <ClipboardDocumentIcon className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mb-4" />
      <p className="text-lg sm:text-xl font-medium text-gray-500 mb-6 text-center">
        {message}
      </p>
      {hasTasks ? (
        <button
          onClick={resetFilters}
          className="inline-flex items-center px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-200"
        >
          View all tasks
        </button>
      ) : (
        <Link
          href="/dashboard"
          className="inline-flex items-center px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-200"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create your first task
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
