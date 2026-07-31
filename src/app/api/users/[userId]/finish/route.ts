import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json().catch(() => ({}));
    const { tutorial_time_seconds } = body;
    const now = new Date();

    await prisma.user.update({
      where: { user_id: userId },
      data: { 
        end_time: now,
        tutorial_time_seconds: typeof tutorial_time_seconds === "number" ? tutorial_time_seconds : undefined,
      },
    });

    return NextResponse.json({ status: "finished" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ detail: "user not found" }, { status: 404 });
    }
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
}
