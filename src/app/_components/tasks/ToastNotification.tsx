import React from "react";
import { Toast } from "./TasksTypes";

interface ToastNotificationProps {
  toast: Toast | null;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg ${
          toast.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        } flex items-center space-x-2 min-w-[300px]`}
        style={{
          animation: toast.undoAction
            ? "slideIn 0.3s ease-out"
            : "slideIn 0.3s ease-out, slideOut 0.3s ease-in 2.7s",
        }}
      >
        {toast.icon && <span className="text-xl">{toast.icon}</span>}
        <span className="flex-1">{toast.message}</span>

        {toast.undoAction && (
          <button
            onClick={toast.undoAction}
            className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
};

export default ToastNotification;
