import React from "react";
import { Task } from "./TasksTypes";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PulseLoader } from "react-spinners";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasksToDelete: string[];
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
  tasks: Task[];
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  tasksToDelete,
  onConfirmDelete,
  isDeleting,
  tasks,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isDeleting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete{" "}
            {tasksToDelete.length === 1 ? "this task" : "these tasks"}? This
            action cannot be undone.
          </p>
          {tasksToDelete.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
              {tasksToDelete.map((taskId) => {
                const task = tasks.find((t) => t.id === taskId);
                return (
                  <div key={taskId} className="text-sm text-gray-700 py-1">
                    • {task?.title}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[100px]"
          >
            {isDeleting ? (
              <PulseLoader color="#ffffff" size={8} margin={4} />
            ) : (
              <>
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
