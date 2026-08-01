import React, { useState } from "react";
import { NASA_TLX_QUESTIONS, NASA_TLX_QUESTIONS_EN } from "@/lib/constants";

interface NasaTlxSurveyProps {
  onSubmit: (answers: Record<string, number>) => void;
  isSubmitting: boolean;
  lang?: "vi" | "en";
}

export default function NasaTlxSurvey({ onSubmit, isSubmitting, lang = "vi" }: NasaTlxSurveyProps) {
  // Initialize scores with default value of 4 (neutral)
  const [answers, setAnswers] = useState<Record<string, number>>({
    mental_demand: 4,
    temporal_demand: 4,
    performance: 4,
    effort: 4,
    frustration: 4,
    overall_load: 4,
  });

  const handleSliderChange = (key: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  const questions = lang === "en" ? NASA_TLX_QUESTIONS_EN : NASA_TLX_QUESTIONS;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
          {lang === "en" ? "Cognitive Workload Survey (NASA-TLX)" : "Khảo sát tải lượng nhận thức (NASA-TLX)"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {lang === "en" 
            ? "Please answer the 6 questions below based on your recent underwriting experience."
            : "Vui lòng trả lời 6 câu hỏi dưới đây dựa trên trải nghiệm thực nghiệm vừa rồi của bạn."}
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        {questions.map((q) => (
          <div key={q.key} className="space-y-3 border-b border-zinc-100 pb-5 last:border-0 last:pb-0 dark:border-zinc-800/80">
            <div>
              <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {q.label}
              </label>
              <p className="text-[12px] text-zinc-500">{q.description}</p>
            </div>

            {/* Slider control */}
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={answers[q.key]}
                onChange={(e) => handleSliderChange(q.key, Number(e.target.value))}
                className="h-2 w-full cursor-pointer rounded-lg bg-zinc-200 accent-zinc-950 dark:bg-zinc-800 dark:accent-zinc-50"
              />
              <div className="flex justify-between text-[11px] font-medium text-zinc-400">
                <span>{q.lowLabel} (1)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300">
                  {lang === "en" ? "Score:" : "Điểm chọn:"} {answers[q.key]} / 7
                </span>
                <span>{q.highLabel} (7)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-zinc-950 px-6 py-3.5 text-sm font-bold text-zinc-50 shadow-sm transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800"
        >
          {isSubmitting 
            ? (lang === "en" ? "Submitting data..." : "Đang gửi dữ liệu...") 
            : (lang === "en" ? "Complete and Submit Survey" : "Hoàn thành và Gửi khảo sát")}
        </button>
      </div>
    </form>
  );
}
