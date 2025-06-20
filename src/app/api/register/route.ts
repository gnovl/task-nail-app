// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Password strength validation
const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumbers) {
    errors.push("Password must contain at least one number");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);

  // Check for disposable email domains (basic list)
  const disposableEmailDomains = [
    "10minutemail.com",
    "tempmail.org",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  const isDisposable = disposableEmailDomains.includes(domain);

  return {
    isValid: isValid && !isDisposable,
    errors: [
      ...(isValid ? [] : ["Please enter a valid email address"]),
      ...(isDisposable ? ["Disposable email addresses are not allowed"] : []),
    ],
  };
};

// Rate limiting
const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
  };
};

// Verify reCAPTCHA
const verifyRecaptcha = async (token: string) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    return false;
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
    return data.success && data.score > 0.5; // For v3, check score
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return false;
  }
};

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : req.headers.get("x-real-ip") || "unknown";

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message: "Too many registration attempts. Please try again later.",
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    const { name, email, password, recaptchaToken } = await req.json();

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return NextResponse.json(
        { message: "reCAPTCHA verification required" },
        { status: 400 }
      );
    }

    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { message: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    // Input sanitization and validation
    const sanitizedName = name?.trim();
    const sanitizedEmail = email?.trim().toLowerCase();

    if (
      !sanitizedName ||
      sanitizedName.length < 2 ||
      sanitizedName.length > 50
    ) {
      return NextResponse.json(
        { message: "Name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    // Validate email
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { message: emailValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          message: "Password does not meet requirements",
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with higher cost factor for better security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
