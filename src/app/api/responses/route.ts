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
      hover_count,
      hover_details,
      chat_count,
      chat_history,
      interactive_clicks,
      telemetry_data,
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

    if (user_id === "u_dev_preview") {
      const exists = await prisma.user.findUnique({
        where: { user_id: "u_dev_preview" }
      });
      if (!exists) {
        await prisma.user.create({
          data: {
            user_id: "u_dev_preview",
            name: "Developer Preview",
            student_code: "dev_code",
            group_assigned: "C",
            start_time: new Date(),
            major: "CNTT",
            ai_frequency: "Hàng ngày",
            age_group: "23-30",
            device: "Desktop",
          }
        });
      }
    }
 
    await prisma.responseLog.create({
      data: {
        user_id,
        scenario_id,
        user_decision,
        time_spent_seconds,
        is_correct_on_error_case: typeof is_correct_on_error_case === "boolean" ? is_correct_on_error_case : null,
        hover_count: typeof hover_count === "number" ? hover_count : 0,
        hover_details: typeof hover_details === "string" ? hover_details : null,
        chat_count: typeof chat_count === "number" ? chat_count : 0,
        chat_history: typeof chat_history === "string" ? chat_history : null,
        interactive_clicks: typeof interactive_clicks === "number" ? interactive_clicks : 0,
        telemetry_data: typeof telemetry_data === "string" ? telemetry_data : null,
      },
    });

    return NextResponse.json({ status: "saved" });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
}
