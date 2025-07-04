"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginModal from "./_components/LoginModal";
import RegisterModal from "./_components/RegisterModal";
import {
  CheckCircleIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import CookiesNotice from "./_components/CookiesNotice";

// Core features to highlight
const features = [
  {
    name: "Task Management",
    description: "Create, edit, and track task status with ease",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Due Date Tracking",
    description: "Never miss deadlines with due date notifications",
    icon: BellIcon,
  },
  {
    name: "Calendar View",
    description: "Visualize tasks by date with priority indicators",
    icon: CalendarIcon,
  },
  {
    name: "Progress Monitoring",
    description: "Track completed tasks and productivity trends",
    icon: ArrowTrendingUpIcon,
  },
];

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Fix hydration issues by properly handling mounted state
  useEffect(() => {
    setIsMounted(true);

    // Check if it's mobile after component mounts to avoid hydration mismatch
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleGetStarted = () => {
    if (!isMounted) return;

    if (isMobile) {
      router.push("/login");
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleRegister = () => {
    if (!isMounted) return;

    if (isMobile) {
      router.push("/register");
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setShowRegistrationSuccess(true);
    setIsLoginModalOpen(true);
  };

  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header/Navigation */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">TaskNail</h1>
          </div>
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={handleGetStarted}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Log In
            </button>
            <button
              onClick={handleRegister}
              className="px-4 py-2 text-sm text-white bg-black hover:bg-gray-800 rounded-md transition-colors"
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Effortlessly manage</span>
                    <span className="block text-black">your daily tasks</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    TaskNail helps you organize your work with a clean,
                    intuitive interface. Stay productive and never miss a
                    deadline again.
                  </p>

                  {/* Feature highlights */}
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:mt-8">
                    {features.map((feature) => (
                      <div
                        key={feature.name}
                        className="bg-white p-3 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center mb-1">
                          <feature.icon className="h-5 w-5 text-gray-600 mr-2" />
                          <h3 className="text-sm font-medium text-gray-900">
                            {feature.name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA buttons - Modified for mobile */}
                  <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                    {/* Desktop CTA buttons */}
                    <div className="hidden sm:block rounded-md shadow">
                      <button
                        onClick={handleGetStarted}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        Get Started
                        <ArrowRightIcon
                          className="ml-2 -mr-1 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                    <div className="hidden sm:block sm:mt-0 sm:ml-3">
                      <button
                        onClick={handleRegister}
                        className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        Register
                      </button>
                    </div>

                    {/* Mobile CTA buttons - Full width and stacked */}
                    <div className="sm:hidden w-full flex flex-col space-y-3">
                      <button
                        onClick={handleGetStarted}
                        className="w-full flex items-center justify-center px-6 py-3 bg-black text-white text-base font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Log In
                        <ArrowRightIcon
                          className="ml-2 -mr-1 h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        onClick={handleRegister}
                        className="w-full flex items-center justify-center px-6 py-3 border border-black text-base font-medium rounded-md text-black bg-white hover:bg-gray-50 transition-colors"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>

                  {/* Free forever badge */}
                  <div className="mt-6 sm:mt-8 flex justify-center lg:justify-start">
                    <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-700">
                        100% Free. No Credit Card Required.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="flex space-x-3 md:space-x-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-700">
              Terms
            </Link>
            <a
              href="https://github.com/gnovl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* Render modals always after mount to prevent hydration issues */}
      {isMounted && (
        <>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => {
              setIsLoginModalOpen(false);
              setShowRegistrationSuccess(false); // Reset success flag when closing
            }}
            onSwitchToRegister={switchToRegister}
            showRegistrationSuccess={showRegistrationSuccess}
          />
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
            onSwitchToLogin={switchToLogin}
          />
        </>
      )}
      {isMounted && <CookiesNotice />}
    </div>
  );
}
