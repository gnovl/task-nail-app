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
  { name: "Quick Task Control", icon: CheckCircleIcon },
  { name: "Real-Time Progress", icon: ChartBarIcon },
  { name: "Streamlined Organize", icon: ClipboardIcon },
  { name: "Smart Reminders", icon: BellIcon },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full max-w-2xl">
          <div className="flex justify-center mb-4">
            <h1 className="text-xl font-bold text-black font-mono">
              ezTaskFlow
            </h1>
          </div>

          <div className="mb-2">
            <Image
              src="/main-pic.jpeg"
              alt="EzTask Logo"
              width={400}
              height={400}
              priority
              className="mx-auto"
            />
          </div>

          <p className="mt-2 text-sm text-gray-600 italic font-light max-w-md mx-auto">
            Stay focused with our intuitive task management solution
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex items-center justify-center text-sm text-gray-600"
              >
                <feature.icon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature.name}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 mb-4 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 w-full max-w-[400px]"
            >
              Sign In
              <ArrowRightIcon
                className="ml-2 -mr-1 h-5 w-5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-black hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 py-4 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center space-x-8">
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
