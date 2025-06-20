// src/app/_components/LoginModal.tsx
"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import Script from "next/script";

// Define error messages for different error codes
const errorMessages = {
  email_not_found:
    "This email is not registered. Please create an account first.",
  invalid_password: "Incorrect password. Please try again.",
  too_many_attempts:
    "Too many failed attempts. Account protection is now active. Please wait 30 minutes before trying again.",
  account_locked:
    "Account temporarily locked for your protection. You can try again in 30 minutes, or contact support if you need immediate access.",
  recaptcha_required:
    "Security verification is now required due to multiple failed attempts.",
  recaptcha_failed:
    "Security verification failed. This is usually temporary - please try again in a few moments.",
  default_error: "Authentication failed. Please check your credentials.",
  CredentialsSignin: "Invalid email or password. Please try again.",
};

// Declare ReCAPTCHA for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  showRegistrationSuccess?: boolean;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
  showRegistrationSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [isVerifyingRecaptcha, setIsVerifyingRecaptcha] = useState(false);

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Fix hydration issues by using useEffect to set mounted state
  useEffect(() => {
    setMounted(true);
    // Check if reCAPTCHA is already loaded from the page
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && showRegistrationSuccess) {
      setSuccess(
        "Registration successful! Please log in with your new account."
      );
      // Clear the success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    }
  }, [isOpen, showRegistrationSuccess]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("auth-modal-open");
    } else {
      document.body.classList.remove("auth-modal-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("auth-modal-open");
    };
  }, [isOpen]);

  // Don't render anything during SSR or until component is mounted
  if (!mounted || !isOpen) return null;

  const executeRecaptcha = async (): Promise<string | null> => {
    if (!recaptchaLoaded || !window.grecaptcha) {
      setError(
        "Security verification not available. Please refresh the page and try again."
      );
      return null;
    }

    setIsVerifyingRecaptcha(true);
    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: "login_modal",
      });
      setIsVerifyingRecaptcha(false);
      return token;
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error);
      setIsVerifyingRecaptcha(false);
      setError(
        "Security verification failed. Please refresh the page and try again."
      );
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let recaptchaToken = null;

      // FIXED: Only execute reCAPTCHA if required (after 3 failed attempts)
      if (showRecaptcha || failedAttempts >= 3) {
        recaptchaToken = await executeRecaptcha();
        if (!recaptchaToken) {
          setIsLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        recaptchaToken, // This might be null, and that's okay for first attempts
      });

      if (result?.error) {
        const currentAttempts = failedAttempts + 1;
        setFailedAttempts(currentAttempts);

        // FIXED: Show reCAPTCHA after 3 failed attempts, not 2
        if (currentAttempts >= 3) {
          setShowRecaptcha(true);
        }

        // Handle specific error messages
        let errorMessage =
          errorMessages[result.error as keyof typeof errorMessages] ||
          "Authentication failed. Please try again.";

        // FIXED: Better error handling for reCAPTCHA
        if (result.error === "recaptcha_required") {
          setShowRecaptcha(true);
          errorMessage =
            "Security verification is now required. Please try again.";
        } else if (result.error === "recaptcha_failed") {
          errorMessage = "Security verification failed. Please try again.";
        } else if (result.error === "account_locked") {
          errorMessage =
            "Account temporarily locked for security. Please try again in 30 minutes.";
        }

        setError(errorMessage);
      } else {
        // Reset failed attempts on success
        setFailedAttempts(0);
        setShowRecaptcha(false);

        // Reset form
        setEmail("");
        setPassword("");
        setError(null);

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

  const getSubmitButtonText = () => {
    if (isVerifyingRecaptcha) return "Verifying security...";
    if (isLoading) return "Signing in...";
    return "Sign in";
  };

  const isSubmitDisabled = () => {
    return (
      isLoading ||
      isVerifyingRecaptcha ||
      (showRecaptcha && RECAPTCHA_SITE_KEY && !recaptchaLoaded)
    );
  };

  // FIXED: Handle reCAPTCHA script loading properly
  const handleRecaptchaLoad = () => {
    setRecaptchaLoaded(true);
  };

  return (
    <>
      {/* Load reCAPTCHA v3 - FIXED: Proper onLoad handler */}
      {RECAPTCHA_SITE_KEY && !window.grecaptcha && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          onLoad={handleRecaptchaLoad}
          strategy="lazyOnload"
        />
      )}

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

          {/* Enhanced security notice - FIXED: Only show when actually required */}
          {showRecaptcha && failedAttempts >= 3 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Enhanced Security Active</p>
                  <p className="text-xs mt-1">
                    Due to multiple login attempts, we&apos;re using additional
                    security verification. This happens automatically in the
                    background.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registration Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="modal-login-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="modal-login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="modal-login-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="modal-login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p>{error}</p>
                    {failedAttempts >= 2 &&
                      !error.includes("temporarily locked") && (
                        <p className="text-xs mt-2">
                          💡 <strong>Tip:</strong> Make sure your email and
                          password are correct. After several failed attempts,
                          accounts are temporarily protected.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled()}
              className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition duration-200 disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading || isVerifyingRecaptcha ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {getSubmitButtonText()}
                </>
              ) : (
                "Sign in"
              )}
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

          {/* reCAPTCHA notice - only show when reCAPTCHA is active */}
          {showRecaptcha && (
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Protected by reCAPTCHA. Google{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Terms
                </a>{" "}
                apply.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
