// src/app/_components/RegisterModal.tsx
"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Script from "next/script";

// Declare ReCAPTCHA for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Fix hydration issues by using useEffect to set mounted state
  useEffect(() => {
    setMounted(true);
    // Check if reCAPTCHA is already loaded from the page
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
    }
  }, []);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    const checks = [
      { test: /.{8,}/, message: "At least 8 characters" },
      { test: /[A-Z]/, message: "One uppercase letter" },
      { test: /[a-z]/, message: "One lowercase letter" },
      { test: /\d/, message: "One number" },
      { test: /[!@#$%^&*(),.?":{}|<>]/, message: "One special character" },
    ];

    const passed = checks.filter((check) => check.test.test(password));
    const failed = checks.filter((check) => !check.test.test(password));

    return {
      score: passed.length,
      feedback: failed.map((check) => check.message),
    };
  };

  useEffect(() => {
    if (password) {
      const strength = checkPasswordStrength(password);
      setPasswordStrength(strength);
      setPasswordErrors(strength.feedback);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
      setPasswordErrors([]);
    }
  }, [password]);

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

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score < 2) return "bg-red-500";
    if (passwordStrength.score < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score < 2) return "Weak";
    if (passwordStrength.score < 4) return "Medium";
    return "Strong";
  };

  // Don't render anything during SSR or until component is mounted
  if (!mounted || !isOpen) return null;

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      isValid = false;
    } else if (name.trim().length > 50) {
      errors.name = "Name must be less than 50 characters";
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    // Password validation - FIXED: Check if all requirements are met
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (passwordStrength.score < 5) {
      // Only show error if password doesn't meet requirements
      errors.password = "Please meet all password requirements";
      isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const executeRecaptcha = async (): Promise<string | null> => {
    if (!recaptchaLoaded || !window.grecaptcha) {
      setError("Security verification not loaded. Please refresh the page.");
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: "register_modal",
      });
      return token;
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error);
      setError("Security verification failed. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Clear previous form errors
    setFormErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha();
      if (!recaptchaToken) {
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFormErrors({});
        setError(null);

        // Close register modal and switch to login with success message
        onClose(); // Close the register modal first
        setTimeout(() => {
          onSwitchToLogin(); // Then open login modal
        }, 100);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join(", "));
        } else {
          setError(data.message || "Registration failed");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine if password requirements are met
  const isPasswordValid = passwordStrength.score === 5;

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

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="relative w-full max-w-md bg-white rounded-md shadow-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="text-center mb-4 sm:mb-6 mt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Join TaskNail
            </h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
              Create your account to start organizing tasks efficiently
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="modal-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id="modal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className={`w-full px-3 py-2 text-sm border ${
                  formErrors.name ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="modal-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="modal-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 text-sm border ${
                  formErrors.email ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="modal-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password *
              </label>
              <input
                type="password"
                id="modal-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 text-sm border ${
                  formErrors.password
                    ? "border-red-300"
                    : password && isPasswordValid
                    ? "border-green-300"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
              />

              {/* Password strength indicator */}
              {password ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">
                      Password strength:
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.score < 2
                          ? "text-red-600"
                          : passwordStrength.score < 4
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {getPasswordStrengthText()}
                      {isPasswordValid ? (
                        <span className="ml-1 text-green-600">✓</span>
                      ) : null}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}

              {/* Password requirements - show only missing requirements */}
              {password && passwordErrors.length > 0 ? (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Still needed:</p>
                  <div className="text-xs space-y-0.5 max-h-16 overflow-y-auto">
                    {passwordErrors.map((error, index) => (
                      <div
                        key={index}
                        className="text-red-600 flex items-center"
                      >
                        <span className="mr-1">•</span>
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Success message when all requirements are met */}
              {password && isPasswordValid ? (
                <div className="mt-2">
                  <p className="text-xs text-green-600 flex items-center">
                    <span className="mr-1">✓</span>
                    All password requirements met!
                  </p>
                </div>
              ) : null}

              {formErrors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="modal-confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password *
              </label>
              <input
                type="password"
                id="modal-confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 text-sm border ${
                  formErrors.confirmPassword
                    ? "border-red-300"
                    : confirmPassword && password === confirmPassword
                    ? "border-green-300"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black`}
              />
              {confirmPassword && password === confirmPassword ? (
                <p className="mt-1 text-xs text-green-600 flex items-center">
                  <span className="mr-1">✓</span>
                  Passwords match
                </p>
              ) : null}
              {formErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (!!RECAPTCHA_SITE_KEY && !recaptchaLoaded)}
              className="w-full py-2 sm:py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-md transition duration-200 disabled:opacity-70 text-sm flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-black font-medium hover:underline focus:outline-none"
            >
              Sign in
            </button>
          </p>

          {/* reCAPTCHA notice - compact for modal */}
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
        </div>
      </div>
    </>
  );
}
