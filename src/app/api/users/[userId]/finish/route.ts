import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const now = new Date();

    await prisma.user.update({
      where: { user_id: userId },
      data: { end_time: now },
    });

    return NextResponse.json({ status: "finished" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ detail: "user not found" }, { status: 404 });
    }
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
}
