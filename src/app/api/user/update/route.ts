import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  // Get the user's session
  const session = await getServerSession(authOptions);

  // If there's no session, return an unauthorized error
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract name and email from the request body
  const { name, email } = await req.json();

  try {
    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id }, // Find the user by their ID
      data: { name, email }, // Update these fields
      select: { id: true, name: true, email: true }, // Select which fields to return
    });

    // Update the session with the new user information
    if (session && session.user) {
      session.user.name = updatedUser.name;
      session.user.email = updatedUser.email;
    }

    // Return the updated user information
    return NextResponse.json(updatedUser);
  } catch (error) {
    // If there's an error, log it and return a 500 status
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
