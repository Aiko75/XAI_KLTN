import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  // Only allow in development mode for safety
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ detail: "Only allowed in development mode" }, { status: 403 });
  }

  try {
    const { scenario_id, feedback } = await req.json().catch(() => ({}));

    if (typeof scenario_id !== "number" || !feedback || typeof feedback !== "string") {
      return NextResponse.json({ detail: "Missing scenario_id or feedback text" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "src", "data", "scenario_feedback.json");

    // Read existing feedback list
    let existingData: any[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        existingData = JSON.parse(fileContent);
        if (!Array.isArray(existingData)) {
          existingData = [];
        }
      } catch (e) {
        existingData = [];
      }
    }

    // Append new entry
    existingData.push({
      scenario_id,
      feedback: feedback.trim(),
      timestamp: new Date().toISOString(),
    });

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf-8");

    return NextResponse.json({ status: "success", count: existingData.length });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
