import React from "react";
import { FEATURES_METADATA } from "@/lib/features";

interface ShapForcePlotProps {
  decision: "approve" | "reject";
  confidencePercent: number;
  factors: Array<{
    feature: string;
    impact: number;
    direction: "positive" | "negative";
  }>;
}

export default function ShapForcePlot({
  decision,
  confidencePercent,
  factors,
}: ShapForcePlotProps) {
  // Base value is typically 0.5 (50%)
  const baseValue = 50;
  
  // Output value (probability of approval)
  const outputValue =
    decision === "approve" ? confidencePercent : 100 - confidencePercent;

  const isApproved = outputValue >= baseValue;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        SHAP Force Plot (Mô hình trực quan hóa lực đẩy)
      </h3>
      <p className="mb-6 text-[12px] text-zinc-500">
        Mỗi yếu tố đóng vai trò như một lực đẩy điểm số duyệt tín dụng rời xa mức trung bình (50%).
      </p>

      {/* Force Plot Visual Bar */}
      <div className="relative mb-8 pt-8">
        {/* Scale Numbers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-1 text-[10px] font-mono text-zinc-400">
          <span>0%</span>
          <span>25%</span>
          <span className="font-bold text-zinc-500">50% (Base)</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        {/* Outer Bar Container */}
        <div className="relative h-7 w-full overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
          {/* Base Value Line */}
          <div className="absolute top-0 bottom-0 left-1/2 z-10 w-0.5 border-l border-dashed border-zinc-400" />

          {/* Force Span */}
          {isApproved ? (
            // Positive contribution block (emerald)
            <div
              className="absolute top-0 bottom-0 flex items-center justify-end bg-gradient-to-r from-emerald-500/20 to-emerald-500 bg-emerald-500 px-3 text-[10px] font-bold text-white transition-all duration-500"
              style={{
                left: "50%",
                width: `${outputValue - baseValue}%`,
              }}
            >
              <span>+{outputValue - baseValue}%</span>
            </div>
          ) : (
            // Negative contribution block (rose)
            <div
              className="absolute top-0 bottom-0 flex items-center justify-start bg-gradient-to-l from-rose-500/20 to-rose-500 bg-rose-500 px-3 text-[10px] font-bold text-white transition-all duration-500"
              style={{
                left: `${outputValue}%`,
                width: `${baseValue - outputValue}%`,
              }}
            >
              <span>-{baseValue - outputValue}%</span>
            </div>
          )}

          {/* Current Output Pointer */}
          <div
            className="absolute top-0 bottom-0 z-20 w-1 bg-zinc-950 dark:bg-zinc-50"
            style={{ left: `${outputValue}%` }}
          />
        </div>

        {/* Pointer Label */}
        <div
          className="absolute -bottom-6 -translate-x-1/2 text-center transition-all duration-500"
          style={{ left: `${outputValue}%` }}
        >
          <span className="block text-[11px] font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {outputValue}%
          </span>
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
            Output
          </span>
        </div>
      </div>

      {/* Force Details Grid */}
      <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-zinc-50/50 p-3 dark:bg-zinc-900/30">
          <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Các lực thúc đẩy (Duyệt)
          </span>
          <ul className="mt-1.5 space-y-1">
            {factors
              .filter((f) => f.direction === "positive")
              .map((f, i) => {
                const meta = FEATURES_METADATA[f.feature];
                return (
                  <li key={i} className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-500">
                    <span>{meta ? meta.label : f.feature}</span>
                    <span className="font-mono font-semibold">+{Math.round(f.impact * 100)}%</span>
                  </li>
                );
              })}
            {factors.filter((f) => f.direction === "positive").length === 0 && (
              <li className="text-xs text-zinc-400 italic">Không có</li>
            )}
          </ul>
        </div>

        <div className="rounded-lg bg-zinc-50/50 p-3 dark:bg-zinc-900/30">
          <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            Các lực kéo giảm (Từ chối)
          </span>
          <ul className="mt-1.5 space-y-1">
            {factors
              .filter((f) => f.direction === "negative")
              .map((f, i) => {
                const meta = FEATURES_METADATA[f.feature];
                return (
                  <li key={i} className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-500">
                    <span>{meta ? meta.label : f.feature}</span>
                    <span className="font-mono font-semibold">{Math.round(f.impact * 100)}%</span>
                  </li>
                );
              })}
            {factors.filter((f) => f.direction === "negative").length === 0 && (
              <li className="text-xs text-zinc-400 italic">Không có</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
