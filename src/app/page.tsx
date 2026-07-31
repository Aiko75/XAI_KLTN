"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, CheckCircle2, AlertTriangle, HelpCircle, MessageSquare } from "lucide-react";
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

const formatMarkdownBold = (text: string) => {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    return i % 2 === 1 ? (
      <strong key={i} className="font-bold text-zinc-950 dark:text-white">
        {part}
      </strong>
    ) : (
      part
    );
  });
};

type AppStep = "WELCOME" | "TUTORIAL" | "TESTING" | "SURVEY" | "FINISHED";

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

  // Tracking States
  const [hoverCount, setHoverCount] = useState<number>(0);
  const [hoverDetails, setHoverDetails] = useState<Record<string, number>>({});
  const [chatCount, setChatCount] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([]);
  const [interactiveClicks, setInteractiveClicks] = useState<number>(0);

  // Timer Refs
  const startTimeRef = useRef<number>(0);
  const tutorialStartTimeRef = useRef<number>(0);
  const [tutorialDuration, setTutorialDuration] = useState<number>(0);

  // Chat states
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

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
      setStep("TUTORIAL"); // Go to tutorial screen first
      tutorialStartTimeRef.current = Date.now(); // Start tutorial timer
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng ký thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTesting = () => {
    const dur = (Date.now() - tutorialStartTimeRef.current) / 1000;
    setTutorialDuration(dur);
    setStep("TESTING");
    startTimeRef.current = Date.now(); // Start the hidden timer

    // Reset tracking states
    setHoverCount(0);
    setHoverDetails({});
    setChatCount(0);
    setChatHistory([]);
    setInteractiveClicks(0);
  };

  const handleHoverFeature = (featureKey: string) => {
    setHoverCount((prev) => prev + 1);
    setHoverDetails((prev) => ({
      ...prev,
      [featureKey]: (prev[featureKey] || 0) + 1,
    }));
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim() || chatLoading) return;

    setChatLoading(true);
    const userMsg = messageText.trim();
    
    // Add user message to history
    setChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatCount((prev) => prev + 1);
    setInteractiveClicks((prev) => prev + 1);

    try {
      const currentScenario = scenarios[currentIndex];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: currentScenario.scenario_id,
          message: userMsg,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: "ai", text: data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: "Xin lỗi, tôi gặp sự cố kết nối. Vui lòng thử lại." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleUserDecision = async (decisionType: "agree" | "reject") => {
    const timeSpent = (Date.now() - startTimeRef.current) / 1000;
    const currentScenario = scenarios[currentIndex];

    // Compute correctness for validation
    let isCorrect: boolean | null = null;
    if (currentScenario.scenario_type === "trap") {
      isCorrect = decisionType === "reject";
    }

    setLoading(true);
    try {
      await saveResponse({
        user_id: userId,
        scenario_id: currentScenario.scenario_id,
        user_decision: decisionType,
        time_spent_seconds: timeSpent,
        is_correct_on_error_case: isCorrect,
        hover_count: hoverCount,
        hover_details: JSON.stringify(hoverDetails),
        chat_count: chatCount,
        chat_history: JSON.stringify(chatHistory),
        interactive_clicks: interactiveClicks,
      });

      if (currentIndex < scenarios.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        startTimeRef.current = Date.now();

        // Reset tracking states for next scenario
        setHoverCount(0);
        setHoverDetails({});
        setChatCount(0);
        setChatHistory([]);
        setInteractiveClicks(0);
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
      await finishUser(userId, tutorialDuration);
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
          {(step === "TESTING" || step === "TUTORIAL") && (
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
              {process.env.NODE_ENV === "development" && (
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-zinc-400 px-1">Dev:</span>
                  {(["A", "B", "C"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGroup(g);
                        setInteractiveClicks((prev) => prev + 1);
                      }}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                        group === g
                          ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
              <span>Mã kiểm thử: {userId}</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-bold uppercase text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                Nhóm {group}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main container */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 animate-fadeIn">
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
                {loading ? "Đang xử lý..." : "Tiếp tục"}
              </button>
            </form>
          </div>
        )}

        {/* 1.5. TUTORIAL SCREEN */}
        {step === "TUTORIAL" && (
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Hướng dẫn đọc giao diện thực nghiệm
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Hệ thống đã xếp bạn vào <span className="font-bold text-zinc-800 dark:text-zinc-200">Nhóm {group}</span>. Vui lòng đọc kỹ cấu trúc các vùng thông tin dưới đây trước khi bắt đầu làm bài test.
            </p>

            <div className="space-y-4 text-xs leading-relaxed text-zinc-650 dark:text-zinc-350">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">1. Khung Hồ sơ khách hàng (Bên trái):</span>
                <p>Hiển thị 8 thông số tài chính thực tế của người xin vay (Tuổi, thu nhập hàng tháng, số tiền xin vay, điểm tín dụng, lịch sử nợ xấu, lịch sử phá sản, tình trạng việc làm...).</p>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">2. Khung Đề xuất của AI (Ở giữa):</span>
                <p>Hiển thị phán quyết gợi ý của mô hình học máy (DUYỆT hoặc TỪ CHỐI) cùng độ tin cậy tương ứng (từ 60% đến 98%).</p>
                {group !== "A" && (
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 font-medium">
                    💡 **Biểu đồ XAI (SHAP Value)**: Chỉ ra trọng số đóng góp của từng thuộc tính. Cột nằm bên phải màu <span className="text-emerald-600 dark:text-emerald-400 font-bold">Xanh lục (+)</span> thể hiện các yếu tố làm tăng cơ hội duyệt. Cột nằm bên trái màu <span className="text-rose-600 dark:text-rose-400 font-bold">Đỏ (-)</span> thể hiện các yếu tố kéo giảm điểm số duyệt.
                  </p>
                )}
              </div>

              {group === "C" && (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">3. Khung phân tích kỹ thuật (Bên phải):</span>
                  <p>Bao gồm **SHAP Force Plot** trực quan hóa các lực đẩy từ mức trung bình 65% đến mức quyết định, và **Ma trận Tương quan 7x7** cùng các chỉ số kiểm định thuật toán để kiểm tra độ tin cậy khoa học.</p>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-400">
              <span>Lưu ý: Thời gian phản hồi sẽ được tính ngay khi bạn bấm nút Bắt đầu.</span>
              <button
                onClick={handleStartTesting}
                className="w-full sm:w-auto rounded-xl bg-zinc-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Bắt đầu thực nghiệm
              </button>
            </div>
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

            {/* Motivational message banner */}
            {currentIndex === 4 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <span>💡 Tuyệt vời! Bạn đã đi được 1/4 chặng đường (5/20 hồ sơ).</span>
              </div>
            )}
            {currentIndex === 9 && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400 font-semibold flex items-center gap-2">
                <span>🎉 Bạn đã hoàn thành 50% chặng đường. Hãy giữ vững sự tập trung nhé!</span>
              </div>
            )}
            {currentIndex === 14 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 dark:bg-amber-950/20 dark:border-emerald-900/40 dark:text-amber-400 font-semibold flex items-center gap-2">
                <span>🚀 Chỉ còn 5 câu hỏi nữa là kết thúc bài test. Cố lên nào!</span>
              </div>
            )}

            {/* Core Layout Grid */}
            {group === "C" ? (
              // 🌟 Unique Dashboard Layout for Group C (Interactive & Contextual XAI)
              <div className="space-y-6">
                {/* Row 1: Hero Row (Force Plot + AI Recommendation Card) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left: Shap Force Plot (2/3 width) */}
                  <div 
                    className="lg:col-span-2"
                    onMouseEnter={() => handleHoverFeature("ShapForcePlot")}
                  >
                    <ShapForcePlot
                      decision={scenarios[currentIndex].ai_prediction.decision}
                      confidencePercent={scenarios[currentIndex].ai_prediction.confidence_percent}
                      factors={scenarios[currentIndex].shap_summary.top_factors}
                    />
                  </div>

                  {/* Right: AI Prediction Card (1/3 width) */}
                  <div 
                    className="lg:col-span-1"
                    onMouseEnter={() => handleHoverFeature("AiDecisionCard")}
                  >
                    <div className="h-full flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <div>
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
                      </div>

                      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                        <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Phân tích giải thích (XAI)
                        </span>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-650 dark:text-zinc-350 font-medium">
                          {formatMarkdownBold(scenarios[currentIndex].shap_summary.text)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Details Row (Profile Table + Bar Chart + Chatbot Card) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Column 1: Client profile (1/3 width) */}
                  <div 
                    className="lg:col-span-1"
                    onMouseEnter={() => handleHoverFeature("ProfileTable")}
                  >
                    <ProfileTable 
                      profile={scenarios[currentIndex].profile} 
                      onHoverFeature={handleHoverFeature}
                    />
                  </div>

                  {/* Column 2: Shap Bar Chart (1/3 width) */}
                  <div 
                    className="lg:col-span-1"
                    onMouseEnter={() => handleHoverFeature("ShapBarChart")}
                  >
                    <ShapBarChart factors={scenarios[currentIndex].shap_summary.top_factors} />
                  </div>

                  {/* Column 3: AI Chatbot (1/3 width) */}
                  <div 
                    className="lg:col-span-1"
                    onMouseEnter={() => handleHoverFeature("AiChatbotCard")}
                  >
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col h-full min-h-[350px]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-zinc-500" />
                        Trợ lý giải thích AI (Gemini Assistant)
                      </h3>

                      {/* Chat messages history */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 p-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40 text-xs scrollbar-thin max-h-[170px]">
                        {chatHistory.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 p-2 space-y-2">
                            <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-850" />
                            <p>Nhấp vào câu hỏi gợi ý bên dưới hoặc tự đặt câu hỏi để trò chuyện với AI.</p>
                          </div>
                        ) : (
                          chatHistory.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                            >
                              <span className="text-[9px] text-zinc-450 dark:text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">
                                {msg.sender === "user" ? "Chuyên viên" : "Trợ lý AI"}
                              </span>
                              <div
                                className={`rounded-lg px-2.5 py-1.5 max-w-[85%] leading-relaxed ${
                                  msg.sender === "user"
                                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                                    : "bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))
                        )}
                        {chatLoading && (
                          <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.2s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.4s]" />
                            <span>AI đang phân tích...</span>
                          </div>
                        )}
                      </div>

                      {/* Quick QAs Suggestions */}
                      {scenarios[currentIndex].interactive_qa && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {scenarios[currentIndex].interactive_qa.map((qa, qIdx) => (
                            <button
                              key={qIdx}
                              disabled={chatLoading}
                              onClick={() => handleSendChatMessage(qa.question)}
                              className="text-[9px] bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-850 px-2 py-0.5 rounded transition-colors text-left truncate max-w-full"
                            >
                              💡 {qa.question}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Text Input area */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <input
                          type="text"
                          disabled={chatLoading}
                          placeholder="Đặt câu hỏi tự do..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                          className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1.5 text-xs focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100 disabled:opacity-50"
                        />
                        <button
                          disabled={chatLoading}
                          onClick={() => handleSendChatMessage()}
                          className="rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3: Technical Details Row (Math Matrix correlations & metrics) */}
                <div 
                  className="w-full"
                  onMouseEnter={() => handleHoverFeature("MathMatrixView")}
                >
                  <MathMatrixView
                    decision={scenarios[currentIndex].ai_prediction.decision}
                    confidencePercent={scenarios[currentIndex].ai_prediction.confidence_percent}
                    factors={scenarios[currentIndex].shap_summary.top_factors}
                  />
                </div>
              </div>
            ) : (
              // 🌟 Standard Grid Layout for Group A & B
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Column 1: Client profile (Always visible) */}
                <div 
                  className="lg:col-span-1"
                  onMouseEnter={() => handleHoverFeature("ProfileTable")}
                >
                  <ProfileTable 
                    profile={scenarios[currentIndex].profile} 
                    onHoverFeature={handleHoverFeature}
                  />
                </div>

                {/* Column 2: AI prediction & Basic XAI (Group B only) */}
                <div className="space-y-6 lg:col-span-1">
                  {/* AI Prediction Card */}
                  <div 
                    className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    onMouseEnter={() => handleHoverFeature("AiDecisionCard")}
                  >
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

                    {/* Group B: Explanations text */}
                    {group !== "A" && (
                      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                        <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Phân tích giải thích (XAI)
                        </span>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-650 dark:text-zinc-350 font-medium">
                          {formatMarkdownBold(scenarios[currentIndex].shap_summary.text)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Group B: Shap Diverging Bar Chart */}
                  {group !== "A" && (
                    <div onMouseEnter={() => handleHoverFeature("ShapBarChart")}>
                      <ShapBarChart factors={scenarios[currentIndex].shap_summary.top_factors} />
                    </div>
                  )}
                </div>

                {/* Column 3: Help Guides for Group A & B */}
                <div className="lg:col-span-1">
                  <div 
                    className="flex h-full flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50/30 p-5 dark:border-zinc-800 dark:bg-zinc-900/10"
                    onMouseEnter={() => handleHoverFeature("HelpGuideCard")}
                  >
                    <div className="space-y-3">
                      <HelpCircle className="h-6 w-6 text-zinc-400" />
                      <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        Hỏi đáp & Chỉ dẫn
                      </h4>
                      <ul className="text-xs text-zinc-550 space-y-2 list-disc list-inside leading-relaxed">
                        {SIDEBAR_TIPS.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-8 border-t border-zinc-200/60 pt-4 text-[10px] text-zinc-400 dark:border-zinc-805">
                      Phiên thí nghiệm được bảo mật và tự động ghi lại thời gian thực hiện.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Decision Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-zinc-200 pt-4 dark:border-zinc-850">
              <button
                onClick={() => handleUserDecision("reject")}
                disabled={loading}
                className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50/50 disabled:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-rose-450 dark:hover:bg-rose-950/20"
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
                <label className="block text-[11px] font-semibold text-zinc-650 dark:text-zinc-350 uppercase tracking-wider">
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
