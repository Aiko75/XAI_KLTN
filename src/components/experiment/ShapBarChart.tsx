import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FEATURES_METADATA } from "@/lib/features";

interface ShapBarChartProps {
  factors: Array<{
    feature: string;
    impact: number;
    direction: "positive" | "negative";
  }>;
}

export default function ShapBarChart({ factors }: ShapBarChartProps) {
  if (!factors || factors.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/20">
        Không có dữ liệu giải thích định lượng cho câu hỏi này.
      </div>
    );
  }

  // Map to recharts format
  const data = factors.map((f) => {
    const meta = FEATURES_METADATA[f.feature];
    const rawVal = f.impact * 100; // Convert to percentage/points
    return {
      name: meta ? meta.label : f.feature,
      value: Number(rawVal.toFixed(1)),
      rawDirection: f.direction,
    };
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Mức độ đóng góp của các thuộc tính (SHAP Value)
      </h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" domain={[-100, 100]} hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={120}
              tick={{ fill: "#71717a", fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: any) => [`${value > 0 ? "+" : ""}${value} pt`, "Ảnh hưởng"]}
              contentStyle={{
                backgroundColor: "rgba(9, 9, 11, 0.95)",
                borderColor: "#27272a",
                borderRadius: "8px",
                color: "#fafafa",
                fontSize: "12px",
              }}
            />
            <ReferenceLine x={0} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => {
                const color = entry.value >= 0 ? "#10b981" : "#f43f5e"; // Emerald-500 vs Rose-500
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Kéo giảm điểm duyệt (Điểm trừ)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Thúc đẩy duyệt (Điểm cộng)</span>
        </div>
      </div>
    </div>
  );
}
