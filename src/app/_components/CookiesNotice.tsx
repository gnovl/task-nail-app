// src/app/_components/CookiesNotice.tsx
"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CookiesNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");
    if (!cookiesAccepted) {
      // Show the notice after a brief delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookiesAccepted", "rejected");
    setIsVisible(false);
  };

  // Don't render during SSR or if not visible
  if (!isLoaded || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Content */}
          <div className="flex-1 pr-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              We use essential cookies to ensure our website works properly and
              analytics cookies to understand how you interact with our site. By
              clicking &quot;Accept All&quot;, you consent to our use of
              cookies.{" "}
              <Link
                href="/privacy"
                className="text-black underline hover:no-underline"
              >
                Learn more in our Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={rejectCookies}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors"
            >
              Accept All
            </button>
            <button
              onClick={rejectCookies}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
