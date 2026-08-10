import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function chooseGroup(): Promise<string> {
  const groups = await prisma.user.groupBy({
    by: ["group_assigned"],
    _count: {
      group_assigned: true,
    },
  });

  const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
  for (const group of groups) {
    counts[group.group_assigned] = group._count.group_assigned;
  }

  // Retention Multipliers based on empirical attrition rates:
  // Group A retains ~91.7% (multiplier 1.0)
  // Group B retains ~69.2% (multiplier 1.35)
  // Group C retains ~54.5% (multiplier 1.85)
  const weightedCounts: Record<string, number> = {
    A: counts.A / 1.0,
    B: counts.B / 1.35,
    C: counts.C / 1.85,
  };

  const minWeighted = Math.min(...Object.values(weightedCounts));
  const candidateGroups = Object.keys(weightedCounts).filter(
    (group) => weightedCounts[group] === minWeighted
  );

  const randomIndex = Math.floor(Math.random() * candidateGroups.length);
  return candidateGroups[randomIndex];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name || null;
    const studentCode = body.student_code || null;
    const major = body.major || null;
    const aiFrequency = body.ai_frequency || null;
    const ageGroup = body.age_group || null;
    const device = body.device || null;

    const groupAssigned = await chooseGroup();
    
    const now = new Date();
    const pad = (n: number, width = 2) => String(n).padStart(width, "0");
    const formatted = 
      now.getUTCFullYear() +
      pad(now.getUTCMonth() + 1) +
      pad(now.getUTCDate()) +
      pad(now.getUTCHours()) +
      pad(now.getUTCMinutes()) +
      pad(now.getUTCSeconds()) +
      pad(now.getUTCMilliseconds(), 3) + 
      pad(Math.floor(Math.random() * 1000), 3);
    const userId = `u_${formatted}`;

    const user = await prisma.user.create({
      data: {
        user_id: userId,
        name,
        student_code: studentCode,
        group_assigned: groupAssigned,
        start_time: now,
        major,
        ai_frequency: aiFrequency,
        age_group: ageGroup,
        device: device,
      },
    });

    return NextResponse.json({
      user_id: user.user_id,
      group_assigned: user.group_assigned,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 400 });
  }
}
