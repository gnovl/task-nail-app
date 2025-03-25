import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 404 });
    }

    const count = await prisma.task.count({
      where: { userId: user.id },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching task count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
