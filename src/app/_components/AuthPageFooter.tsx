// src/app/_components/AuthPageFooter.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function AuthPageFooter() {
  return (
    <footer className="w-full py-6 px-4 bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Brand and Copyright */}
        <div className="text-center md:text-left">
          <p className="text-sm font-medium text-gray-900">TaskNail</p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} TaskNail. All rights reserved.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm text-gray-500">
          <Link
            href="/privacy"
            className="hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-700 transition-colors">
            Terms of Service
          </Link>
          <a
            href="https://github.com/gnovl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700 transition-colors"
          >
            Contact
          </a>
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Home
          </Link>
        </div>
      </div>
    </footer>
  );
}
