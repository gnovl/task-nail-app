import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClipboardIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Quick Task Control",
    description: "Effortlessly manage and prioritize your daily tasks",
    icon: CheckCircleIcon,
  },
  {
    name: "Real-Time Progress",
    description: "Track your productivity with visual analytics",
    icon: ChartBarIcon,
  },
  {
    name: "Streamlined Organize",
    description: "Keep your projects and tasks neatly structured",
    icon: ClipboardIcon,
  },
  {
    name: "Smart Reminders",
    description: "Never miss a deadline with intelligent notifications",
    icon: BellIcon,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Simplify your workflow</span>
                    <span className="block text-green-600">with taskEzy</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Stay focused and organized with our intuitive task
                    management solution. Boost your productivity and achieve
                    more, every day.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                        <ArrowRightIcon
                          className="ml-2 -mr-1 h-5 w-5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        href="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 md:py-4 md:text-lg md:px-10"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to stay productive
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.name}
                    </p>
                    <p className="mt-2 ml-16 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer remains unchanged */}
      <footer className="bg-gray-50 py-3 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-6">
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 text-xs underline"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-gray-900 text-xs underline"
            >
              Privacy
            </Link>
            <Link
              href="https://github.com/yourusername/eztask"
              className="text-gray-600 hover:text-gray-900 text-xs underline"
            >
              GitHub
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-gray-900 text-xs underline"
            >
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
