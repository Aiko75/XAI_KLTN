import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      user_id,
      scenario_id,
      user_decision,
      time_spent_seconds,
      is_correct_on_error_case,
    } = body;

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ detail: "user_id must be a string" }, { status: 400 });
    }
    if (typeof scenario_id !== "number" || scenario_id < 1) {
      return NextResponse.json({ detail: "scenario_id must be an integer >= 1" }, { status: 400 });
    }
    if (user_decision !== "agree" && user_decision !== "reject") {
      return NextResponse.json({ detail: "user_decision must be 'agree' or 'reject'" }, { status: 400 });
    }
    if (typeof time_spent_seconds !== "number" || time_spent_seconds < 0) {
      return NextResponse.json({ detail: "time_spent_seconds must be a number >= 0" }, { status: 400 });
    }

    await prisma.responseLog.create({
      data: {
        user_id,
        scenario_id,
        user_decision,
        time_spent_seconds,
        is_correct_on_error_case: typeof is_correct_on_error_case === "boolean" ? is_correct_on_error_case : null,
      },
    });

    return NextResponse.json({ status: "saved" });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
}
