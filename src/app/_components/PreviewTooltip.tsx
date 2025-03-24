import React, { useState, useEffect } from "react";
import { LightBulbIcon } from "@heroicons/react/24/outline";

export default function PreviewTooltip() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-white px-4 py-2.5 rounded-md shadow-sm border border-gray-200 text-sm flex items-center gap-2">
      <LightBulbIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
      <span className="text-gray-600">
        Pro tip: Click on any date with dots to pin the task preview
      </span>
    </div>
  );
}
