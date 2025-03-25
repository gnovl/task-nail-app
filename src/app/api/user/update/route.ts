import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req: Request) {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // If there's no session, return an unauthorized error
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Extract name and email from the request body
    const { name, email } = await req.json();

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
