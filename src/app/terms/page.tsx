"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
            Terms of Service
          </h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600">
                By accessing or using TaskNail, you agree to be bound by these
                Terms of Service. If you do not agree to all the terms and
                conditions, you may not access or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. Description of Service
              </h2>
              <p className="text-gray-600">
                TaskNail provides a task management platform that allows users
                to create, organize, and track their personal and professional
                tasks. We reserve the right to modify or discontinue the service
                at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. User Accounts
              </h2>
              <p className="text-gray-600">
                To use TaskNail, you must create an account with a valid email
                address and password. You are responsible for maintaining the
                confidentiality of your account and for all activities that
                occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. User Conduct
              </h2>
              <p className="text-gray-600">
                You agree not to use TaskNail for any unlawful purpose or in any
                way that could damage, disable, overburden, or impair our
                service. You may not attempt to gain unauthorized access to any
                part of the service or any systems or networks connected to
                TaskNail.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. Data Ownership
              </h2>
              <p className="text-gray-600">
                You retain all rights to your data. We do not claim ownership of
                the content you create, upload, or store in TaskNail. We only
                use your data as necessary to provide and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-600">
                TaskNail is provided &quot;as is&quot; without warranties of any
                kind. In no event shall TaskNail be liable for any direct,
                indirect, incidental, special, or consequential damages arising
                out of or in any way connected with the use of our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                7. Contact
              </h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please
                contact us at{" "}
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
