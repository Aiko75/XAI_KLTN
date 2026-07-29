import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NASA_TLX_KEYS = new Set([
  "mental_demand",
  "temporal_demand",
  "performance",
  "effort",
  "frustration",
  "overall_load",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { user_id, nasa_tlx } = body;

    if (!user_id || typeof user_id !== "string") {
      return NextResponse.json({ detail: "user_id must be a string" }, { status: 400 });
    }
    if (!nasa_tlx || typeof nasa_tlx !== "object") {
      return NextResponse.json({ detail: "nasa_tlx must be an object" }, { status: 400 });
    }

    const keys = Object.keys(nasa_tlx);
    for (const key of keys) {
      if (!NASA_TLX_KEYS.has(key)) {
        return NextResponse.json({ detail: `Unsupported NASA-TLX key: ${key}` }, { status: 400 });
      }
      const score = nasa_tlx[key];
      if (typeof score !== "number" || score < 1 || score > 7) {
        return NextResponse.json({ detail: `NASA-TLX score for ${key} must be in range 1..7` }, { status: 400 });
      }
    }

    const now = new Date();
    await prisma.surveyLog.createMany({
      data: keys.map((key) => ({
        user_id,
        question_key: key,
        score: nasa_tlx[key],
        created_at: now,
      })),
    });

    return NextResponse.json({ status: "saved" });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
}
