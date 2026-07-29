import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(val: any): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { start_time: "desc" },
    });

    const responseLogs = await prisma.responseLog.findMany({
      orderBy: { created_at: "desc" },
    });

    const surveyLogs = await prisma.surveyLog.findMany({
      orderBy: { created_at: "desc" },
    });

    let csv = "";

    // 1. users
    csv += "[users]\n";
    csv += "user_id,name,student_code,group_assigned,start_time,end_time,feedback\n";
    for (const u of users) {
      csv += `${csvEscape(u.user_id)},${csvEscape(u.name)},${csvEscape(u.student_code)},${csvEscape(u.group_assigned)},${csvEscape(u.start_time?.toISOString())},${csvEscape(u.end_time?.toISOString())},${csvEscape(u.feedback)}\n`;
    }
    csv += "\n";

    // 2. response_logs
    csv += "[response_logs]\n";
    csv += "id,user_id,scenario_id,user_decision,time_spent_seconds,is_correct_on_error_case,created_at\n";
    for (const r of responseLogs) {
      csv += `${csvEscape(r.id)},${csvEscape(r.user_id)},${csvEscape(r.scenario_id)},${csvEscape(r.user_decision)},${csvEscape(r.time_spent_seconds)},${csvEscape(r.is_correct_on_error_case)},${csvEscape(r.created_at?.toISOString())}\n`;
    }
    csv += "\n";

    // 3. survey_logs
    csv += "[survey_logs]\n";
    csv += "id,user_id,question_key,score,created_at\n";
    for (const s of surveyLogs) {
      csv += `${csvEscape(s.id)},${csvEscape(s.user_id)},${csvEscape(s.question_key)},${csvEscape(s.score)},${csvEscape(s.created_at?.toISOString())}\n`;
    }

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=experiment_export.csv",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
}
