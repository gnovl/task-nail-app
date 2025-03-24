"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Find the scrollable container (the parent with overflow-auto)
    const findScrollContainer = () => {
      // Look for the main content div in SidebarLayout
      const contentDiv = document.querySelector(".flex-1.overflow-auto");
      if (contentDiv) {
        scrollContainerRef.current = contentDiv as HTMLDivElement;
        return true;
      }
      return false;
    };

    const success = findScrollContainer();
    if (!success) {
      console.error("Could not find scroll container");
      return;
    }

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setIsVisible(scrollContainerRef.current.scrollTop > 300);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[9999] p-2 bg-white text-gray-600 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all duration-300 flex items-center justify-center ${
        isVisible
          ? "opacity-90 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTop;
