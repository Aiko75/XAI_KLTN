import React, { useState } from "react";
import { NASA_TLX_QUESTIONS, NASA_TLX_QUESTIONS_EN } from "@/lib/constants";

interface NasaTlxSurveyProps {
  onSubmit: (answers: Record<string, number>) => void;
  isSubmitting: boolean;
  lang?: "vi" | "en";
}

export default function NasaTlxSurvey({ onSubmit, isSubmitting, lang = "vi" }: NasaTlxSurveyProps) {
  // Initialize scores with default value of 4 (neutral) and button comprehension check
  const [answers, setAnswers] = useState<Record<string, number>>({
    button_comprehension: 1, // 1 = Correct ("DUYỆT VAY"), 0 = Misunderstood ("TỪ CHỐI CHO VAY")
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
          {lang === "en" ? "Cognitive Workload & Verification Survey" : "Khảo sát nhận thức & Kiểm tra nút bấm"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {lang === "en" 
            ? "Please complete the button understanding check and the 6 workload questions below."
            : "Vui lòng hoàn thành 1 câu hỏi kiểm tra hiểu biết về nút bấm và 6 đánh giá nhận thức dưới đây."}
        </p>
      </div>

      {/* COMPREHENSION CHECK CARD */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-6 shadow-sm dark:border-amber-700/50 dark:bg-amber-950/30">
        <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
            !
          </span>
          <h3 className="text-base font-bold">
            {lang === "en" ? "Button Understanding Check" : "Câu hỏi Kiểm tra Hiểu biết về Nhãn Nút Bấm"}
          </h3>
        </div>
        <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
          {lang === "en"
            ? "Throughout the 20 scenarios, when the AI recommended 'REJECT LOAN' and you clicked the red button 'REJECT AI RECOMMENDATION', what did you intend this action to mean?"
            : "Trong suốt 20 tình huống vừa qua, khi bạn thấy AI đưa ra đề xuất 'TỪ CHỐI CHO VAY' và bạn nhấp chọn nút màu đỏ 'TỪ CHỐI ĐỀ XUẤT CỦA AI', trong tư duy suy nghĩ của bạn, hành động này có nghĩa là gì?"}
        </p>

        <div className="mt-4 space-y-3">
          <label className={`flex cursor-pointer items-start space-x-3 rounded-xl border p-3 text-xs transition-all ${
            answers.button_comprehension === 1
              ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-100 font-medium"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          }`}>
            <input
              type="radio"
              name="button_comprehension"
              value={1}
              checked={answers.button_comprehension === 1}
              onChange={() => handleSliderChange("button_comprehension", 1)}
              className="mt-0.5 h-4 w-4 accent-emerald-600"
            />
            <div>
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                {lang === "en" ? "Option 1: You intended to APPROVE the loan" : "Lựa chọn 1: Bạn muốn DUYỆT VAY khoản này"}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {lang === "en"
                  ? "(Bác bỏ / Không đồng ý với phán quyết từ chối của AI)"
                  : "(Bác bỏ / Không đồng ý với phán quyết từ chối của AI -> tương ứng việc Duyệt vay)"}
              </p>
            </div>
          </label>

          <label className={`flex cursor-pointer items-start space-x-3 rounded-xl border p-3 text-xs transition-all ${
            answers.button_comprehension === 0
              ? "border-amber-500 bg-amber-100/80 text-amber-950 shadow-sm dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-100 font-medium"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          }`}>
            <input
              type="radio"
              name="button_comprehension"
              value={0}
              checked={answers.button_comprehension === 0}
              onChange={() => handleSliderChange("button_comprehension", 0)}
              className="mt-0.5 h-4 w-4 accent-amber-600"
            />
            <div>
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                {lang === "en" ? "Option 2: You intended to REJECT the loan" : "Lựa chọn 2: Bạn muốn TỪ CHỐI CHO VAY khoản này"}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {lang === "en"
                  ? "(Agreeing with the decision to reject the loan profile)"
                  : "(Đồng quan điểm từ chối hồ sơ vay với AI)"}
              </p>
            </div>
          </label>
        </div>
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
