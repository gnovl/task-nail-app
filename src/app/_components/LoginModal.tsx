"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define error messages for different error codes
const errorMessages = {
  email_not_found:
    "This email is not registered. Please create an account first.",
  invalid_password: "Incorrect password. Please try again.",
  default_error: "Authentication failed. Please check your credentials.",
  CredentialsSignin: "Invalid email or password. Please try again.",
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Fix hydration issues by using useEffect to set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR or until component is mounted
  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        console.error("Authentication error:", result.error);
        setError(
          errorMessages[result.error as keyof typeof errorMessages] ||
            "Authentication failed. Please try again."
        );
      } else {
        onClose();
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md bg-white rounded-md shadow-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Sign in to TaskNail
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Access your tasks and manage your productivity
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition duration-200 disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-black font-medium hover:underline focus:outline-none"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
