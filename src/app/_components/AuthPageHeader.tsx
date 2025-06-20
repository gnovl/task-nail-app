// src/app/_components/AuthPageHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthPageHeaderProps {
  showBackToHome?: boolean;
  backToHomeText?: string;
}

export default function AuthPageHeader({
  showBackToHome = true,
  backToHomeText = "Back to Home",
}: AuthPageHeaderProps) {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Back to Home Link */}
        {showBackToHome ? (
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{backToHomeText}</span>
          </Link>
        ) : (
          <div /> // Empty div for spacing
        )}

        {/* Logo/Brand */}
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">TaskNail</h1>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm bg-black text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
