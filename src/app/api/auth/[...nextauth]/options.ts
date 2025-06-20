// src/app/api/auth/[...nextauth]/options.ts
import { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET;

// Rate limiting store for login attempts
const loginAttempts = new Map<
  string,
  { count: number; resetTime: number; blockedUntil?: number }
>();

// Custom error types
const AUTH_ERROR = {
  EMAIL_NOT_FOUND: "email_not_found",
  INVALID_PASSWORD: "invalid_password",
  TOO_MANY_ATTEMPTS: "too_many_attempts",
  RECAPTCHA_REQUIRED: "recaptcha_required",
  RECAPTCHA_FAILED: "recaptcha_failed",
  ACCOUNT_LOCKED: "account_locked",
  DEFAULT: "default_error",
};

// Check if user is temporarily locked
const checkAccountLock = (email: string) => {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (!record) return { isLocked: false };

  if (record.blockedUntil && now < record.blockedUntil) {
    return {
      isLocked: true,
      unlockTime: record.blockedUntil,
    };
  }

  // Clean up expired blocks
  if (record.blockedUntil && now >= record.blockedUntil) {
    loginAttempts.delete(email);
  }

  return { isLocked: false };
};

// Track failed login attempts
const trackFailedAttempt = (email: string) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  const lockDuration = 30 * 60 * 1000; // 30 minutes

  const record = loginAttempts.get(email);

  if (!record || now > record.resetTime) {
    loginAttempts.set(email, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { shouldBlock: false, remaining: maxAttempts - 1 };
  }

  record.count++;

  if (record.count >= maxAttempts) {
    record.blockedUntil = now + lockDuration;
    return {
      shouldBlock: true,
      remaining: 0,
      unlockTime: record.blockedUntil,
    };
  }

  return {
    shouldBlock: false,
    remaining: maxAttempts - record.count,
  };
};

// Clear successful login attempts
const clearFailedAttempts = (email: string) => {
  loginAttempts.delete(email);
};

// Verify reCAPTCHA - FIXED: Better error handling and debugging
const verifyRecaptcha = async (token: string) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    return { success: false, error: "Configuration error" };
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    // Log for debugging (remove in production)
    console.log("reCAPTCHA verification result:", data);

    // For v3, check score. For v2, just check success
    const isValid = data.success && (!data.score || data.score > 0.5);

    return {
      success: isValid,
      score: data.score,
      error: data["error-codes"] ? data["error-codes"].join(", ") : null,
    };
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return { success: false, error: "Network error" };
  }
};

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: secret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "reCAPTCHA Token", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(AUTH_ERROR.DEFAULT);
        }

        const email = credentials.email.toLowerCase().trim();

        // Check if account is locked
        const lockStatus = checkAccountLock(email);
        if (lockStatus.isLocked) {
          throw new Error(AUTH_ERROR.ACCOUNT_LOCKED);
        }

        // FIXED: Only require reCAPTCHA after 3 failed attempts, not 2
        const attemptRecord = loginAttempts.get(email);
        const requiresRecaptcha = attemptRecord && attemptRecord.count >= 3;

        // FIXED: Only validate reCAPTCHA if it's required AND provided
        if (requiresRecaptcha) {
          if (!credentials.recaptchaToken) {
            throw new Error(AUTH_ERROR.RECAPTCHA_REQUIRED);
          }

          const recaptchaResult = await verifyRecaptcha(
            credentials.recaptchaToken
          );
          if (!recaptchaResult.success) {
            console.error(
              "reCAPTCHA validation failed:",
              recaptchaResult.error
            );
            throw new Error(AUTH_ERROR.RECAPTCHA_FAILED);
          }
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            trackFailedAttempt(email);
            throw new Error(AUTH_ERROR.EMAIL_NOT_FOUND);
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            const failureResult = trackFailedAttempt(email);
            if (failureResult.shouldBlock) {
              throw new Error(AUTH_ERROR.ACCOUNT_LOCKED);
            }
            throw new Error(AUTH_ERROR.INVALID_PASSWORD);
          }

          // Clear failed attempts on successful login
          clearFailedAttempts(email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production" ? ".tasknail.com" : undefined,
      },
    },
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: string;
      session?: any;
    }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.email = session.user.email;
      }

      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
