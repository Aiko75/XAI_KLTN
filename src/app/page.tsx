"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import {
  Scenario,
  fetchScenarios,
  startUser,
  saveResponse,
  saveSurvey,
  finishUser,
  saveFeedback,
} from "@/lib/api";
import {
  WELCOME_TITLE,
  WELCOME_DESCRIPTION,
  SIDEBAR_TIPS,
} from "@/lib/constants";
import ProfileTable from "@/components/experiment/ProfileTable";
import ShapBarChart from "@/components/experiment/ShapBarChart";
import ShapForcePlot from "@/components/experiment/ShapForcePlot";
import MathMatrixView from "@/components/experiment/MathMatrixView";
import NasaTlxSurvey from "@/components/experiment/NasaTlxSurvey";

type AppStep = "WELCOME" | "TESTING" | "SURVEY" | "FINISHED";

export default function Home() {
  const [step, setStep] = useState<AppStep>("WELCOME");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // User State
  const [name, setName] = useState<string>("");
  const [studentCode, setStudentCode] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [group, setGroup] = useState<"A" | "B" | "C">("A");

  // Feedback State
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Scenarios State
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Timer Ref
  const startTimeRef = useRef<number>(0);

  // Load scenarios on mount
  useEffect(() => {
    fetchScenarios()
      .then((data) => setScenarios(data))
      .catch((err) => {
        console.error(err);
        setError("Không thể tải danh sách kịch bản. Vui lòng làm mới trang.");
      });
  }, []);

  const handleStartExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentCode.trim()) {
      setError("Vui lòng điền đầy đủ Họ tên và Mã số sinh viên.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userRes = await startUser(name.trim(), studentCode.trim());
      setUserId(userRes.user_id);
      setGroup(userRes.group_assigned);
      setCurrentIndex(0);
      setStep("TESTING");
      startTimeRef.current = Date.now();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng ký thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserDecision = async (decisionType: "agree" | "reject") => {
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    const currentScenario = scenarios[currentIndex];

    // Compute correctness for validation
    let isCorrect: boolean | null = null;
    if (currentScenario.scenario_type === "trap") {
      isCorrect = decisionType === "reject";
    } else if (currentScenario.scenario_type === "attention_check") {
      if (currentScenario.scenario_id === 7) {
        isCorrect = decisionType === "reject";
      } else if (currentScenario.scenario_id === 15) {
        isCorrect = decisionType === "agree";
      }
    }

    setLoading(true);
    try {
      await saveResponse({
        user_id: userId,
        scenario_id: currentScenario.scenario_id,
        user_decision: decisionType,
        time_spent_seconds: timeSpent,
        is_correct_on_error_case: isCorrect,
      });

      if (currentIndex < scenarios.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        startTimeRef.current = Date.now();
      } else {
        setStep("SURVEY");
      }
    } catch (err: any) {
      setError(err.message || "Không thể ghi nhận câu trả lời. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSurveySubmit = async (answers: Record<string, number>) => {
    setLoading(true);
    try {
      await saveSurvey(userId, answers);
      await finishUser(userId);
      setStep("FINISHED");
    } catch (err: any) {
      setError(err.message || "Không thể gửi bài khảo sát. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setLoading(true);
    try {
      await saveFeedback(userId, feedbackText.trim());
      setFeedbackSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Không thể gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      {/* Header bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-6 w-1.5 rounded-full bg-zinc-950 dark:bg-zinc-50" />
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
              XAI HCI Experiment
            </h1>
          </div>
          {step === "TESTING" && (
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <span>Mã kiểm thử: {userId}</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-bold uppercase text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                Nhóm {group}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main container */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        {error && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 shadow-lg max-w-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. WELCOME SCREEN */}
        {step === "WELCOME" && (
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {WELCOME_TITLE}
            </h2>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              {WELCOME_DESCRIPTION}
            </p>
            <form onSubmit={handleStartExperiment} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Mã số sinh viên (MSSV)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: SV123456"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800"
              >
                <Play className="h-4 w-4 fill-current" />
                {loading ? "Đang xử lý..." : "Bắt đầu làm bài"}
              </button>
            </form>
          </div>
        )}

        {/* 2. TESTING STATE (20 SCENARIOS) */}
        {step === "TESTING" && scenarios.length > 0 && (
          <div className="w-full max-w-6xl space-y-6">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Hồ sơ tín dụng {currentIndex + 1} trên {scenarios.length}</span>
              <span>Đang thực hiện...</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-zinc-950 dark:bg-zinc-50 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
              />
            </div>

            {/* Core Layout Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Column 1: Client profile (Always visible) */}
              <div className="lg:col-span-1">
                <ProfileTable profile={scenarios[currentIndex].profile} />
              </div>

              {/* Column 2: AI prediction & Basic XAI (Group B & C) */}
              <div className="space-y-6 lg:col-span-1">
                {/* AI Prediction Card */}
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Phán quyết gợi ý của AI
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        scenarios[currentIndex].ai_prediction.decision === "approve"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                      }`}
                    >
                      {scenarios[currentIndex].ai_prediction.decision === "approve"
                        ? "Đề xuất: DUYỆT"
                        : "Đề xuất: TỪ CHỐI"}
                    </span>
                    <span className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      Độ tin cậy: {scenarios[currentIndex].ai_prediction.confidence_percent}%
                    </span>
                  </div>

                  {/* Group B / C: Explanations text */}
                  {group !== "A" && (
                    <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                      <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Phân tích giải thích (XAI)
                      </span>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                        {scenarios[currentIndex].shap_summary.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Group B / C: Shap Diverging Bar Chart */}
                {group !== "A" && (
                  <ShapBarChart factors={scenarios[currentIndex].shap_summary.top_factors} />
                )}
              </div>

              {/* Column 3: Advanced Over-complex XAI (Group C only) */}
              <div className="space-y-6 lg:col-span-1">
                {group === "C" ? (
                  <>
                    <ShapForcePlot
                      decision={scenarios[currentIndex].ai_prediction.decision}
                      confidencePercent={scenarios[currentIndex].ai_prediction.confidence_percent}
                      factors={scenarios[currentIndex].shap_summary.top_factors}
                    />
                    <MathMatrixView
                      decision={scenarios[currentIndex].ai_prediction.decision}
                      confidencePercent={scenarios[currentIndex].ai_prediction.confidence_percent}
                      factors={scenarios[currentIndex].shap_summary.top_factors}
                    />
                  </>
                ) : (
                  // Placeholders/Tips for Group A & B
                  <div className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 dark:border-zinc-800 dark:bg-zinc-900/10">
                    <div className="space-y-3">
                      <HelpCircle className="h-6 w-6 text-zinc-400" />
                      <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        Hỏi đáp & Chỉ dẫn
                      </h4>
                      <ul className="text-xs text-zinc-500 space-y-2 list-disc list-inside">
                        {SIDEBAR_TIPS.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-8 border-t border-zinc-200/60 pt-4 text-[10px] text-zinc-400 dark:border-zinc-800">
                      Phiên thí nghiệm được bảo mật và tự động ghi lại thời gian thực hiện.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <button
                onClick={() => handleUserDecision("reject")}
                disabled={loading}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50/50 disabled:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-400 dark:hover:bg-rose-950/20"
              >
                Bác bỏ AI / Thay đổi quyết định
              </button>
              <button
                onClick={() => handleUserDecision("agree")}
                disabled={loading}
                className="rounded-xl bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800"
              >
                Đồng ý với đề xuất của AI
              </button>
            </div>
          </div>
        )}

        {/* 3. SURVEY STATE (NASA-TLX) */}
        {step === "SURVEY" && (
          <NasaTlxSurvey onSubmit={handleSurveySubmit} isSubmitting={loading} />
        )}

        {/* 4. FINISHED STATE */}
        {step === "FINISHED" && (
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Hoàn thành thực nghiệm!
            </h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Cám ơn bạn rất nhiều vì đã tham gia đóng góp câu trả lời. Toàn bộ dữ liệu của bạn đã được mã hóa và ghi nhận thành công vào cơ sở dữ liệu cloud.
            </p>

            {/* Optional Feedback form */}
            {!feedbackSubmitted ? (
              <div className="mt-6 border-t border-zinc-100 pt-6 text-left dark:border-zinc-800/80">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  Ý kiến phản hồi / Nhận xét (Không bắt buộc)
                </label>
                <textarea
                  placeholder="Nhập ý kiến của bạn về giao diện, giải thích XAI hoặc các lỗi của hệ thống..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="mt-2 h-20 w-full rounded-xl border border-zinc-200 p-2.5 text-xs focus:border-zinc-950 focus:outline-none dark:border-zinc-850 dark:bg-zinc-950 dark:focus:border-zinc-50 resize-none"
                />
                <button
                  type="button"
                  onClick={handleFeedbackSubmit}
                  disabled={loading || !feedbackText.trim()}
                  className="mt-2.5 w-full rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800"
                >
                  {loading ? "Đang gửi..." : "Gửi phản hồi"}
                </button>
              </div>
            ) : (
              <div className="mt-6 border-t border-zinc-100 pt-6 text-xs text-emerald-600 dark:border-zinc-850/80 dark:text-emerald-400 font-semibold">
                Cám ơn bạn đã gửi ý kiến đóng góp!
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <a
                href="/docs"
                className="rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Xem tài liệu API (Swagger UI)
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950">
        <span>© {new Date().getFullYear()} Đề tài Nghiên cứu HCI & Explainable AI (XAI)</span>
      </footer>
    </div>
  );
}
