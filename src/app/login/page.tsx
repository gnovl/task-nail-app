// src/app/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import CookiesNotice from "../_components/CookiesNotice";
import AuthPageHeader from "../_components/AuthPageHeader";
import AuthPageFooter from "../_components/AuthPageFooter";

// Define error messages for different error codes - CONSISTENT WITH MODAL
const errorMessages: Record<string, string> = {
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

function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [isVerifyingRecaptcha, setIsVerifyingRecaptcha] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  useEffect(() => {
    // Show welcome message if redirected after registration
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setSuccess(
        "Registration successful! Please log in with your new account."
      );
    }

    // Handle error message from URL
    const errorType = searchParams.get("error");
    if (errorType) {
      setError(
        errorType in errorMessages
          ? errorMessages[errorType]
          : "An error occurred during login."
      );

      // Show reCAPTCHA if account is locked or too many attempts
      if (errorType === "account_locked" || errorType === "too_many_attempts") {
        setShowRecaptcha(true);
        setFailedAttempts(3); // Set to trigger reCAPTCHA requirement
      }
    }

    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
    }
  }, [searchParams]);

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
        action: "login",
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
    setSuccess(null);
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

        // Handle specific error messages - CONSISTENT WITH MODAL
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
        router.push("/dashboard");
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
      (showRecaptcha && !!RECAPTCHA_SITE_KEY && !recaptchaLoaded)
    );
  };

  // FIXED: Handle reCAPTCHA script loading properly
  const handleRecaptchaLoad = () => {
    setRecaptchaLoaded(true);
  };

  return (
    <>
      {/* Load reCAPTCHA v3 - FIXED: Proper onLoad handler */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          onLoad={handleRecaptchaLoad}
          strategy="lazyOnload"
        />
      )}

      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <AuthPageHeader showBackToHome={true} />

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="w-full p-8 space-y-6 bg-white rounded-lg shadow-lg">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Sign in to TaskNail
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Access your tasks and manage your productivity
                </p>
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-sm">
                  {success}
                </div>
              )}

              {/* Enhanced security notice - FIXED: Only show when actually required */}
              {showRecaptcha && failedAttempts >= 3 && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
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
                        Due to multiple login attempts, we're using additional
                        security verification. This happens automatically in the
                        background.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                    className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
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
                    className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
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
                              password are correct. After several failed
                              attempts, accounts are temporarily protected.
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitDisabled()}
                  className="w-full px-4 py-3 text-white bg-black hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-70 flex items-center justify-center"
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

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-black font-medium hover:underline"
                  >
                    Create account
                  </Link>
                </p>
              </div>

              {/* reCAPTCHA notice - only show when reCAPTCHA is active */}
              {showRecaptcha && (
                <div className="text-center">
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
                      Terms of Service
                    </a>{" "}
                    apply.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <AuthPageFooter />

        {/* Cookies Notice */}
        <CookiesNotice />
      </div>
    </>
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AuthPageHeader showBackToHome={true} />
      <main className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-center text-gray-600">Loading login form...</p>
        </div>
      </main>
      <AuthPageFooter />
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
