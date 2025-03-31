"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">TaskNail</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Introduction
              </h2>
              <p className="text-gray-600">
                At TaskNail, we respect your privacy and are committed to
                protecting your personal data. This privacy policy will inform
                you about how we look after your personal data when you visit
                our website and tell you about your privacy rights and how the
                law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. Data We Collect
              </h2>
              <p className="text-gray-600">
                We collect basic account information including your name and
                email address when you register. We also collect information
                about your tasks and activity within the application to provide
                our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. How We Use Your Data
              </h2>
              <p className="text-gray-600">
                We use your data to provide and improve our task management
                service. This includes:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600">
                <li>Providing account functionality</li>
                <li>Storing and managing your tasks</li>
                <li>Improving our service and user experience</li>
                <li>Communicating important updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. Data Security
              </h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your
                personal data against unauthorized access, alteration,
                disclosure, or destruction. Your password is securely hashed,
                and all data is stored in secure databases.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. Contact
              </h2>
              <p className="text-gray-600">
                If you have any questions about this privacy policy or our data
                practices, please contact us at{" "}
                <a
                  href="https://github.com/gnovl"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  our GitHub
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: March 31, 2025
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0 text-center md:text-left">
            <p className="text-sm font-medium text-gray-900">TaskNail</p>
            <p className="text-xs text-gray-500">
              © 2025 TaskNail. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
