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
import translations from "@/data/translations.json";
import ProfileTable from "@/components/experiment/ProfileTable";
import ShapBarChart from "@/components/experiment/ShapBarChart";
import ShapForcePlot from "@/components/experiment/ShapForcePlot";
import MathMatrixView from "@/components/experiment/MathMatrixView";
import NasaTlxSurvey from "@/components/experiment/NasaTlxSurvey";
import { predictLoanApproval } from "@/lib/rfPredictor";

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

const translateText = (text: string, lang: "vi" | "en") => {
  if (lang === "vi") return text;
  let translated = text;
  
  // 1. Individual risk factors translations (must run early)
  translated = translated.replace(/khách hàng có (\d+) lần nợ quá hạn nợ xấu trước đây \(Cảnh báo đỏ\)/gi, "the client has $1 previous default(s) (Red Warning)");
  translated = translated.replace(/tỷ lệ nợ trên thu nhập DTI ở mức cao (\d+)%/gi, "high Debt-to-Income (DTI) ratio ($1%)");
  translated = translated.replace(/điểm tín dụng FICO ở mức trung bình yếu (\d+) điểm/gi, "weak FICO credit score ($1 pts)");
  translated = translated.replace(/hồ sơ có lịch sử nợ xấu nhiều lần/gi, "multiple previous defaults");
  translated = translated.replace(/tỷ lệ DTI ở mức báo động/gi, "warning level DTI ratio");
  translated = translated.replace(/điểm tín dụng quá thấp/gi, "extremely low credit score");
  translated = translated.replace(/khách hàng đã từng phá sản/gi, "previous bankruptcy history");

  // 2. Template sentence overrides (must run before general token overrides)
  translated = translated.replace(/Hồ sơ thực tế có các điểm rủi ro đáng chú ý: (.*?)\. Bạn cần đối chiếu kỹ lưỡng trước khi phê duyệt\./gi, 
    "The profile contains notable risk factors: $1. You need to review them carefully before approval.");
    
  translated = translated.replace(/Hồ sơ tương đối sạch và an toàn: không có nợ xấu, tỷ lệ DTI an toàn \((.*?)\), và điểm tín dụng tốt \((.*?)\)\./gi,
    "The profile is relatively clean and safe: no default history, safe DTI ratio ($1), and good credit score ($2).");

  translated = translated.replace(/mô hình (?:nghiêng về )?đề xuất \*\*(?:DUYỆT VAY|DUYỆT|approve|approval)\*\* chủ yếu nhờ các yếu tố tích cực như (.*?), lấn át hoàn toàn điểm trừ từ (.*?)\./gi, 
    "the model leans towards proposing **approval** mainly due to positive factors such as $1, completely outweighing negative factors of $2.");
    
  translated = translated.replace(/mô hình (?:nghiêng về )?đề xuất \*\*(?:TỪ CHỐI|reject|rejection)\*\* do chịu ảnh hưởng tiêu cực từ điểm trừ từ (.*?), vượt trội so với yếu tố tích cực như (.*?)\./gi,
    "the model recommends **rejection** due to negative impact from $1, dominating positive factors such as $2.");
    
  translated = translated.replace(/mô hình (?:nghiêng về )?đề xuất \*\*(?:DUYỆT VAY|DUYỆT|approve|approval)\*\* do ghi nhận nhiều yếu tố tích cực như (.*?)\./gi,
    "the model recommends **approval** due to multiple positive factors such as $1.");
    
  translated = translated.replace(/mô hình (?:nghiêng về )?đề xuất \*\*(?:TỪ CHỐI|reject|rejection)\*\* do ghi nhận nhiều điểm trừ từ (.*?)\./gi,
    "the model recommends **rejection** due to multiple negative factors of $1.");
    
  translated = translated.replace(/mô hình (?:nghiêng về )?đề xuất \*\*(?:DUYỆT VAY|DUYỆT|approve|approval)\*\* dựa trên các chỉ số an toàn ổn định của hồ sơ\./gi,
    "the model recommends **approval** based on the stable and safe credit indicators of the profile.");
    
  translated = translated.replace(/mô hình (?:nghiêng về )?đề xuất \*\*(?:TỪ CHỐI|reject|rejection)\*\* dựa trên mức độ rủi ro tín dụng chung của hồ sơ\./gi,
    "the model recommends **rejection** based on the general credit risk of the profile.");

  // Chatbot specific templates
  translated = translated.replace(/Mô hình AI nhận thấy/gi, "The AI model observes that");
  
  // Q2 & Q3 template sentences
  translated = translated.replace(/Hồ sơ tương đối sạch và an toàn/gi, "The profile is relatively clean and safe");
  translated = translated.replace(/không có nợ xấu/gi, "no default history");
  translated = translated.replace(/tỷ lệ DTI an toàn/gi, "safe DTI ratio");
  translated = translated.replace(/và điểm tín dụng tốt/gi, "and good credit score");
  translated = translated.replace(/Khách hàng có lịch sử tín dụng rất xấu/gi, "The client has a very poor credit history");
  translated = translated.replace(/có nợ xấu/gi, "has defaults");
  translated = translated.replace(/lần nợ quá hạn/gi, "delinquency event(s)");
  translated = translated.replace(/tỷ lệ DTI ở mức báo động/gi, "DTI ratio is at warning levels");
  translated = translated.replace(/điểm tín dụng quá thấp/gi, "credit score is too low");
  translated = translated.replace(/khách hàng đã từng phá sản/gi, "the client has bankruptcy history");
  translated = translated.replace(/đã từng có tiền án phá sản/gi, "has a bankruptcy record");
  
  // Trap checks and warnings
  translated = translated.replace(/AI quyết định rất chính xác/gi, "The AI decision is highly accurate");
  translated = translated.replace(/bởi vì nợ xấu và DTI cao là chỉ số rủi ro lớn/gi, "because defaults and high DTI are major risk factors");
  translated = translated.replace(/bởi vì lịch sử nợ xấu nhiều lần là dấu hiệu cảnh báo cao/gi, "because multiple defaults are a high warning sign");
  translated = translated.replace(/bởi vì điểm tín dụng quá thấp/gi, "because the credit score is too low");
  translated = translated.replace(/bởi vì khách hàng đã từng phá sản/gi, "because the client has bankruptcy history");
  
  translated = translated.replace(/Cảnh báo: Khách hàng có các chỉ số tài chính rất tốt và đủ điều kiện duyệt vay, nhưng AI vẫn từ chối nhầm do các thiên lệch ngẫu nhiên của mô hình\. Bạn nên bác bỏ quyết định của AI\./gi, "Warning: The client has very good financial indicators and is qualified for approval, but the AI rejected them by mistake due to random model bias. You should override the AI decision.");
  translated = translated.replace(/Cảnh báo: Khách hàng có nợ xấu nghiêm trọng hoặc chỉ số rất yếu, nhưng AI vẫn duyệt nhầm do các thiên lệch ngẫu nhiên của mô hình\. Bạn nên bác bỏ quyết định của AI\./gi, "Warning: The client has serious defaults or very weak indicators, but the AI approved them by mistake due to random model bias. You should override the AI decision.");
  translated = translated.replace(/Cảnh báo: Mô hình AI đang bị thiên lệch bởi yếu tố thu nhập cao và bỏ qua lịch sử nợ xấu nghiêm trọng\. Quyết duyệt này là SAI LẦM thực tế, bạn nên bác bỏ quyết định của AI\./gi, "Warning: The AI model is biased by the high income factor and ignores the serious history of defaults. This approval is a practical MISTAKE, you should override the AI decision.");
  translated = translated.replace(/Mô hình toán học của AI hoạt động chính xác và nhất quán với quy tắc tín dụng ngân hàng thông thường đối với hồ sơ này\./gi, "The mathematical AI model operates accurately and consistently with standard bank credit rules for this profile.");
  translated = translated.replace(/Điều này tạo nên mức độ tin cậy/gi, "This results in a confidence level of");

  // 3. Feature names
  translated = translated.replace(/Thu nhập hàng tháng/gi, "Monthly Income");
  translated = translated.replace(/Thu nhập/gi, "Income");
  translated = translated.replace(/Khoản vay/gi, "Loan Amount");
  translated = translated.replace(/Điểm tín dụng/gi, "Credit Score");
  translated = translated.replace(/Tỷ lệ DTI/gi, "DTI Ratio");
  translated = translated.replace(/Nợ xấu/gi, "Previous Defaults");
  translated = translated.replace(/Phá sản/gi, "Bankruptcy");
  translated = translated.replace(/Việc làm/gi, "Employment Status");
  translated = translated.replace(/Tuổi/gi, "Age");
  
  // General conversions
  translated = translated.replace(/ điểm/g, " pts");
  translated = translated.replace(/ lần/g, " time(s)");
  translated = translated.replace(/ tuổi/g, " years old");
  
  // Clean up any remaining double asterisks translation bugs (like approval vay -> approval)
  translated = translated.replace(/approval vay/gi, "approval");
  translated = translated.replace(/từ chối vay/gi, "rejection");

  // Capitalize first letter of the overall text for neatness
  if (translated.length > 0) {
    translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  }

  return translated;
};

export default function Home() {
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const t = (translations as any)[lang];

  const getTranslatedQuestion = (q: string) => {
    if (lang === "vi") return q;
    const qLower = q.toLowerCase();
    if (qLower.includes("tại sao ai") || qLower.includes("vì sao ai")) return "Why did the AI make this decision?";
    if (qLower.includes("rủi ro") || qLower.includes("chú ý")) return "What risk factors should I look out for in this profile?";
    if (qLower.includes("tin cậy") || qLower.includes("đáng tin")) return "Is this AI recommendation highly reliable?";
    return q;
  };

  const [step, setStep] = useState<AppStep>("WELCOME");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // User State
  const [name, setName] = useState<string>("");
  const [studentCode, setStudentCode] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [occupationType, setOccupationType] = useState<string>("");
  const [subOccupationType, setSubOccupationType] = useState<string>("");
  const [aiFrequency, setAiFrequency] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [device, setDevice] = useState<string>("Desktop");
  const [userId, setUserId] = useState<string>("");
  const [group, setGroup] = useState<"A" | "B" | "C">("A");

  // Device detection on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|iphone|ipad|ipod|android|blackberry|opera mini|iemobile|webos|fennec|windown phone/i.test(ua);
      const isTablet = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
      
      let detectedDevice = "Desktop";
      if (isMobile) {
        detectedDevice = "Mobile";
      } else if (isTablet || window.innerWidth < 1024) {
        detectedDevice = "Tablet";
      }
      setDevice(detectedDevice);
    }
  }, []);

  // Synchronize major field with occupation and sub-occupation combined value
  useEffect(() => {
    if (occupationType) {
      if (subOccupationType) {
        setMajor(`${occupationType} - ${subOccupationType}`);
      } else {
        setMajor(occupationType);
      }
    } else {
      setMajor("");
    }
  }, [occupationType, subOccupationType]);

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

  // Developer feedback states
  const [devFeedbackText, setDevFeedbackText] = useState<string>("");
  const [devFeedbackStatus, setDevFeedbackStatus] = useState<string>("");
  const [devSubmitMode, setDevSubmitMode] = useState<boolean>(false);

  // Load scenarios on mount
  useEffect(() => {
    fetchScenarios()
      .then((data) => setScenarios(data))
      .catch((err) => {
        console.error(err);
        setError("Không thể tải danh sách kịch bản. Vui lòng làm mới trang.");
      });
  }, []);

  // What-If Simulation State
  const [simProfile, setSimProfile] = useState<{
    Age: number;
    MonthlyIncome: number;
    LoanAmount: number;
    CreditScore: number;
    TotalDebtToIncomeRatio: number;
    PreviousLoanDefaults: number;
    BankruptcyHistory: number;
    EmploymentStatus: string;
  } | null>(null);

  // Sync simProfile with scenarios[currentIndex] on load or scenario index change
  useEffect(() => {
    if (scenarios.length > 0 && scenarios[currentIndex]) {
      const p = scenarios[currentIndex].profile;
      setSimProfile({
        Age: p.Age,
        MonthlyIncome: p.MonthlyIncome,
        LoanAmount: p.LoanAmount,
        CreditScore: p.CreditScore,
        TotalDebtToIncomeRatio: p.TotalDebtToIncomeRatio,
        PreviousLoanDefaults: p.PreviousLoanDefaults,
        BankruptcyHistory: p.BankruptcyHistory,
        EmploymentStatus: p.EmploymentStatus
      });
    }
  }, [currentIndex, scenarios]);

  // Advanced Mobile Telemetry Refs
  const xaiDwellStartTimeRef = useRef<number | null>(null);
  const xaiDwellTotalRef = useRef<number>(0);
  
  const hiddenStartTimeRef = useRef<number | null>(null);
  const totalHiddenTimeRef = useRef<number>(0);

  const maxScrollDepthRef = useRef<number>(0);
  const scrollDirChangesRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const lastScrollDirRef = useRef<"up" | "down" | null>(null);

  const touchDurationsRef = useRef<number[]>([]);
  const rageTapsRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapXRef = useRef<number>(0);
  const lastTapYRef = useRef<number>(0);
  const tapCountInStreakRef = useRef<number>(0);

  // Reset scenario-level metrics when currentIndex changes
  useEffect(() => {
    xaiDwellStartTimeRef.current = null;
    xaiDwellTotalRef.current = 0;
    hiddenStartTimeRef.current = null;
    totalHiddenTimeRef.current = 0;
    maxScrollDepthRef.current = 0;
    scrollDirChangesRef.current = 0;
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
    lastScrollDirRef.current = null;
    touchDurationsRef.current = [];
    rageTapsRef.current = 0;
    lastTapTimeRef.current = 0;
    lastTapXRef.current = 0;
    lastTapYRef.current = 0;
    tapCountInStreakRef.current = 0;
    setDevFeedbackText("");
    setDevFeedbackStatus("");
  }, [currentIndex]);

  // Listener 1: Page Visibility API (subtract idle time)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      
      if (document.visibilityState === "hidden") {
        hiddenStartTimeRef.current = Date.now();
        if (xaiDwellStartTimeRef.current !== null) {
          xaiDwellTotalRef.current += (Date.now() - xaiDwellStartTimeRef.current) / 1000;
          xaiDwellStartTimeRef.current = null;
        }
      } else if (document.visibilityState === "visible") {
        if (hiddenStartTimeRef.current !== null) {
          totalHiddenTimeRef.current += (Date.now() - hiddenStartTimeRef.current) / 1000;
          hiddenStartTimeRef.current = null;
        }
        // If testing and element is visible, viewport observer will resume tracking
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Listener 2: Intersection Observer API (XAI element Viewport Dwell Time)
  useEffect(() => {
    if (typeof window === "undefined" || step !== "TESTING" || group !== "C") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            xaiDwellStartTimeRef.current = Date.now();
          } else {
            if (xaiDwellStartTimeRef.current !== null) {
              xaiDwellTotalRef.current += (Date.now() - xaiDwellStartTimeRef.current) / 1000;
              xaiDwellStartTimeRef.current = null;
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const el = document.getElementById("xai-explanation-panel");
    if (el) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      if (xaiDwellStartTimeRef.current !== null) {
        xaiDwellTotalRef.current += (Date.now() - xaiDwellStartTimeRef.current) / 1000;
        xaiDwellStartTimeRef.current = null;
      }
    };
  }, [step, currentIndex, group]);

  // Listener 3: Scroll patterns (Scroll depth & direction flips)
  useEffect(() => {
    if (typeof window === "undefined" || step !== "TESTING") return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (documentHeight > windowHeight) {
        const depthPct = Math.round((scrollY / (documentHeight - windowHeight)) * 100);
        if (depthPct > maxScrollDepthRef.current) {
          maxScrollDepthRef.current = Math.min(depthPct, 100);
        }
      }

      if (scrollY !== lastScrollYRef.current) {
        const currentDir = scrollY > lastScrollYRef.current ? "down" : "up";
        if (lastScrollDirRef.current !== null && lastScrollDirRef.current !== currentDir) {
          scrollDirChangesRef.current += 1;
        }
        lastScrollDirRef.current = currentDir;
        lastScrollYRef.current = scrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [step, currentIndex]);

  // Listener 4: Touch events & Rage tap monitor
  useEffect(() => {
    if (typeof window === "undefined" || step !== "TESTING") return;

    const touchStartTimes = new Map<string, number>();

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const identifier = String(touch.identifier);
      touchStartTimes.set(identifier, Date.now());

      const tapX = touch.clientX;
      const tapY = touch.clientY;
      const now = Date.now();
      
      const dist = Math.sqrt(Math.pow(tapX - lastTapXRef.current, 2) + Math.pow(tapY - lastTapYRef.current, 2));
      const timeDiff = now - lastTapTimeRef.current;

      if (timeDiff < 350 && dist < 30) {
        tapCountInStreakRef.current += 1;
        if (tapCountInStreakRef.current >= 3) {
          rageTapsRef.current += 1;
          tapCountInStreakRef.current = 0;
        }
      } else {
        tapCountInStreakRef.current = 1;
      }

      lastTapTimeRef.current = now;
      lastTapXRef.current = tapX;
      lastTapYRef.current = tapY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const identifier = String(touch.identifier);
      const startTime = touchStartTimes.get(identifier);
      if (startTime) {
        const duration = Date.now() - startTime;
        touchDurationsRef.current.push(duration);
        touchStartTimes.delete(identifier);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      touchStartTimes.set("mouse", Date.now());

      const tapX = e.clientX;
      const tapY = e.clientY;
      const now = Date.now();
      
      const dist = Math.sqrt(Math.pow(tapX - lastTapXRef.current, 2) + Math.pow(tapY - lastTapYRef.current, 2));
      const timeDiff = now - lastTapTimeRef.current;

      if (timeDiff < 350 && dist < 30) {
        tapCountInStreakRef.current += 1;
        if (tapCountInStreakRef.current >= 3) {
          rageTapsRef.current += 1;
          tapCountInStreakRef.current = 0;
        }
      } else {
        tapCountInStreakRef.current = 1;
      }

      lastTapTimeRef.current = now;
      lastTapXRef.current = tapX;
      lastTapYRef.current = tapY;
    };

    const handleMouseUp = () => {
      const startTime = touchStartTimes.get("mouse");
      if (startTime) {
        const duration = Date.now() - startTime;
        touchDurationsRef.current.push(duration);
        touchStartTimes.delete("mouse");
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [step, currentIndex]);

  const handleSimChange = (key: string, value: any) => {
    setSimProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: value
      };
    });
    setInteractiveClicks((prev) => prev + 1);
  };

  const handleStartExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentCode.trim() || !occupationType || !aiFrequency || !ageGroup) {
      setError(lang === "en" ? "Please fill in all information fields." : "Vui lòng điền đầy đủ toàn bộ thông tin yêu cầu.");
      return;
    }
    const needsSub = occupationType === "Sinh viên" || occupationType === "Student" || occupationType === "Người đi làm" || occupationType === "Employed";
    if (needsSub && !subOccupationType) {
      setError(lang === "en" ? "Please select your major or industry details." : "Vui lòng chọn chi tiết chuyên ngành hoặc lĩnh vực của bạn.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userRes = await startUser(
        name.trim(), 
        studentCode.trim(), 
        major, 
        aiFrequency,
        ageGroup,
        device
      );
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
    
    // Add user message to history (translated to English if lang === "en")
    const displayMsg = lang === "en" ? getTranslatedQuestion(userMsg) : userMsg;
    setChatHistory((prev) => [...prev, { sender: "user", text: displayMsg }]);
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
    // 1. Compute out-of-focus (hidden/background) time
    let extraHidden = 0;
    if (hiddenStartTimeRef.current !== null) {
      extraHidden = (Date.now() - hiddenStartTimeRef.current) / 1000;
    }
    const finalHiddenTime = totalHiddenTimeRef.current + extraHidden;

    // 2. Compute final time spent excluding hidden time
    const rawTimeSpent = (Date.now() - startTimeRef.current) / 1000;
    const timeSpent = Math.max(0.1, rawTimeSpent - finalHiddenTime);

    // 3. Compute XAI card dwell duration
    let extraXaiDwell = 0;
    if (xaiDwellStartTimeRef.current !== null) {
      extraXaiDwell = (Date.now() - xaiDwellStartTimeRef.current) / 1000;
    }
    const xaiDwellTotal = xaiDwellTotalRef.current + extraXaiDwell;

    // 4. Compute touch metrics
    const tDurations = touchDurationsRef.current;
    const avgTouchDuration = tDurations.length > 0
      ? Math.round(tDurations.reduce((sum, val) => sum + val, 0) / tDurations.length)
      : 0;

    // 5. Construct telemetry_data JSON string
    const telemetryObj = {
      device_detected: device,
      screen_width: typeof window !== "undefined" ? window.innerWidth : 0,
      screen_height: typeof window !== "undefined" ? window.innerHeight : 0,
      scroll_depth_pct: maxScrollDepthRef.current,
      scroll_dir_changes: scrollDirChangesRef.current,
      rage_taps: rageTapsRef.current,
      avg_touch_duration_ms: avgTouchDuration,
      xai_dwell_time_seconds: Math.round(xaiDwellTotal * 100) / 100,
      hidden_time_seconds: Math.round(finalHiddenTime * 100) / 100,
      raw_time_spent_seconds: Math.round(rawTimeSpent * 100) / 100
    };
    const telemetryDataStr = JSON.stringify(telemetryObj);

    const currentScenario = scenarios[currentIndex];

    // Compute correctness for validation
    let isCorrect: boolean | null = null;
    if (currentScenario.scenario_type === "trap") {
      isCorrect = decisionType === "reject";
    }

    setLoading(true);
    try {
      if (userId !== "u_dev_preview" || devSubmitMode) {
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
          telemetry_data: telemetryDataStr,
        });
      }

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

  const handleSendDevFeedback = async () => {
    if (!devFeedbackText.trim()) return;
    setDevFeedbackStatus("sending");
    try {
      const currentScenario = scenarios[currentIndex];
      const res = await fetch("/api/dev/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: currentScenario.scenario_id,
          feedback: devFeedbackText,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save feedback");
      }
      setDevFeedbackStatus("success");
    } catch (e) {
      setDevFeedbackStatus("error");
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
          <div className="flex items-center gap-4">
            <span className="h-6 w-1.5 rounded-full bg-zinc-950 dark:bg-zinc-50" />
            <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
              XAI HCI Experiment
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
              <span>{lang === "en" ? "Change language:" : "Đổi ngôn ngữ:"}</span>
              <button
                type="button"
                onClick={() => {
                  setLang((prev) => (prev === "vi" ? "en" : "vi"));
                  setInteractiveClicks((prev) => prev + 1);
                }}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-805 transition-colors uppercase cursor-pointer"
              >
                🌐 {lang === "vi" ? "English" : "Tiếng Việt"}
              </button>
            </div>
          </div>
          {process.env.NODE_ENV === "development" ? (
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-lg">
                <span className="text-[9px] uppercase font-bold text-zinc-400 px-1">Dev:</span>
                {(["A", "B", "C"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
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
                
                {/* Scenario Preview Picker */}
                <select
                  value={step === "TESTING" ? currentIndex : ""}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    if (!isNaN(idx)) {
                      setUserId("u_dev_preview");
                      setStep("TESTING");
                      setCurrentIndex(idx);
                    }
                  }}
                  className="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[10px] font-semibold px-1 py-0.5 ml-1 text-zinc-850 dark:text-zinc-150"
                >
                  <option value="" disabled>{lang === "en" ? "Preview Scenario..." : "Xem nhanh câu..."}</option>
                  {scenarios.map((_, i) => (
                    <option key={i} value={i}>
                      {lang === "en" ? `Scenario ${i + 1}` : `Câu ${i + 1}`}
                    </option>
                  ))}
                </select>

                {/* Save Response Toggle Switch */}
                <div className="flex items-center gap-1 bg-zinc-200/40 dark:bg-zinc-850 px-2 py-0.5 rounded border border-zinc-300/30 dark:border-zinc-700/30 ml-1">
                  <label className="text-[9px] font-bold text-zinc-650 dark:text-zinc-350 uppercase flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={devSubmitMode}
                      onChange={(e) => setDevSubmitMode(e.target.checked)}
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-0 cursor-pointer h-3 w-3"
                    />
                    {lang === "en" ? "Record Answers" : "Ghi câu trả lời"}
                  </label>
                </div>
              </div>
              {(step === "TESTING" || step === "TUTORIAL") && (
                <span>{lang === "en" ? "User ID:" : "Mã kiểm thử:"} {userId}</span>
              )}
            </div>
          ) : (
            (step === "TESTING" || step === "TUTORIAL") && (
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                <span>{lang === "en" ? "User ID:" : "Mã kiểm thử:"} {userId}</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 font-bold uppercase text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  {lang === "en" ? "Group" : "Nhóm"} {group}
                </span>
              </div>
            )
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
              {lang === "en" ? t.login_title : WELCOME_TITLE}
            </h2>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              {lang === "en" ? t.login_desc : WELCOME_DESCRIPTION}
            </p>
            {device !== "Desktop" && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-250 p-4 text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400 font-semibold leading-relaxed">
                {t.mobile_warning}
              </div>
            )}
            <form onSubmit={handleStartExperiment} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.name_label}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "en" ? "e.g. John Doe" : "Ví dụ: Nguyễn Văn A"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.student_code_label}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "en" ? "e.g. STU12345" : "Ví dụ: SV123456"}
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                />
              </div>

              {/* Major of Study */}
              {/* Occupation selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.major_label}
                </label>
                <select
                  required
                  value={occupationType}
                  onChange={(e) => {
                    setOccupationType(e.target.value);
                    setSubOccupationType("");
                  }}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm bg-transparent focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                >
                  <option value="" disabled className="text-zinc-400 dark:bg-zinc-950">{t.major_placeholder}</option>
                  <option value={lang === "en" ? "Student" : "Sinh viên"} className="dark:bg-zinc-950">{lang === "en" ? "Student" : "Sinh viên"}</option>
                  <option value={lang === "en" ? "Employed" : "Người đi làm"} className="dark:bg-zinc-950">{lang === "en" ? "Employed / Professional" : "Người đi làm"}</option>
                  <option value={lang === "en" ? "Self-Employed" : "Tự doanh / Tự do"} className="dark:bg-zinc-950">{lang === "en" ? "Self-Employed / Freelancer" : "Tự doanh / Tự do"}</option>
                  <option value={lang === "en" ? "Other" : "Khác"} className="dark:bg-zinc-950">{lang === "en" ? "Other" : "Khác"}</option>
                </select>
              </div>

              {/* Sub-Occupation (Only visible for Sinh viên and Người đi làm) */}
              {(occupationType === "Sinh viên" || occupationType === "Student" || occupationType === "Người đi làm" || occupationType === "Employed") && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {lang === "en" ? "Details / Sector" : "Chuyên ngành / Lĩnh vực chi tiết"}
                  </label>
                  <select
                    required
                    value={subOccupationType}
                    onChange={(e) => setSubOccupationType(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm bg-transparent focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                  >
                    <option value="" disabled className="text-zinc-400 dark:bg-zinc-950">{t.sub_major_placeholder}</option>
                    {(occupationType === "Sinh viên" || occupationType === "Student") ? (
                      <>
                        <option value={lang === "en" ? "STEM / Technical" : "Khối ngành Kỹ thuật / Công nghệ"} className="dark:bg-zinc-950">
                          {lang === "en" ? "STEM / Technical" : "Khối ngành Kỹ thuật / Công nghệ"}
                        </option>
                        <option value={lang === "en" ? "Economics / Business" : "Khối ngành Kinh tế / Quản trị"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Economics / Business" : "Khối ngành Kinh tế / Quản trị"}
                        </option>
                        <option value={lang === "en" ? "Medical / Healthcare" : "Khối ngành Y tế / Sức khỏe"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Medical / Healthcare" : "Khối ngành Y tế / Sức khỏe"}
                        </option>
                        <option value={lang === "en" ? "Social Sciences" : "Khối ngành Khoa học Xã hội"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Social Sciences / Humanities" : "Khối ngành Khoa học Xã hội"}
                        </option>
                        <option value={lang === "en" ? "Other" : "Khác"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Other" : "Khác"}
                        </option>
                      </>
                    ) : (
                      <>
                        <option value={lang === "en" ? "Tech / Engineering" : "Lĩnh vực Kỹ thuật / Công nghệ"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Tech / Engineering" : "Lĩnh vực Kỹ thuật / Công nghệ"}
                        </option>
                        <option value={lang === "en" ? "Finance / Business" : "Lĩnh vực Kinh tế / Tài chính / Quản trị"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Finance / Business / Management" : "Lĩnh vực Kinh tế / Tài chính / Quản trị"}
                        </option>
                        <option value={lang === "en" ? "Healthcare / Education" : "Lĩnh vực Y tế / Giáo dục"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Healthcare / Education / Public Services" : "Lĩnh vực Y tế / Giáo dục / Dịch vụ công"}
                        </option>
                        <option value={lang === "en" ? "Other" : "Lĩnh vực khác"} className="dark:bg-zinc-950">
                          {lang === "en" ? "Other" : "Lĩnh vực khác"}
                        </option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* AI Frequency */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.ai_frequency_label}
                </label>
                <select
                  required
                  value={aiFrequency}
                  onChange={(e) => setAiFrequency(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm bg-transparent focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                >
                  <option value="" disabled className="text-zinc-400 dark:bg-zinc-950">{t.ai_frequency_placeholder}</option>
                  <option value="Hiếm khi" className="dark:bg-zinc-950">{t.ai_freq_never}</option>
                  <option value="Thỉnh thoảng" className="dark:bg-zinc-950">{t.ai_freq_occasional}</option>
                  <option value="Thường xuyên" className="dark:bg-zinc-950">{t.ai_freq_weekly}</option>
                  <option value="Hàng ngày" className="dark:bg-zinc-950">{t.ai_freq_daily}</option>
                </select>
              </div>

              {/* Age Group */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t.age_group_label}
                </label>
                <select
                  required
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm bg-transparent focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                >
                  <option value="" disabled className="text-zinc-400 dark:bg-zinc-950">{t.age_group_placeholder}</option>
                  <option value="< 18" className="dark:bg-zinc-950">{t.age_under_18}</option>
                  <option value="18-22" className="dark:bg-zinc-950">{t.age_18_22}</option>
                  <option value="23-30" className="dark:bg-zinc-950">{t.age_23_30}</option>
                  <option value="31-45" className="dark:bg-zinc-950">{t.age_31_45}</option>
                  <option value="> 45" className="dark:bg-zinc-950">{t.age_above_45}</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800"
              >
                <Play className="h-4 w-4 fill-current" />
                {loading ? (lang === "en" ? "Processing..." : "Đang xử lý...") : t.btn_continue}
              </button>
            </form>
          </div>
        )}

        {/* 1.5. TUTORIAL SCREEN */}
        {step === "TUTORIAL" && (
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {t.onboarding_title}
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {t.onboarding_desc.replace("{group}", group)}
            </p>

            <div className="space-y-4 text-xs leading-relaxed text-zinc-650 dark:text-zinc-350">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{t.onboarding_col1_title}</span>
                <p>{t.onboarding_col1_desc}</p>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{t.onboarding_col2_title}</span>
                <p>{t.onboarding_col2_desc}</p>
                {group !== "A" && (
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 font-medium">
                    {formatMarkdownBold(t.onboarding_col2_tip)}
                  </p>
                )}
              </div>

              {group === "C" && (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-850 dark:bg-zinc-900/40 space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{t.onboarding_col3_title}</span>
                  <p>{formatMarkdownBold(t.onboarding_col3_desc)}</p>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-400">
              <span>{lang === "en" ? "Note: Response time will start tracking once you click Start." : "Lưu ý: Thời gian phản hồi sẽ được tính ngay khi bạn bấm nút Bắt đầu."}</span>
              <button
                onClick={handleStartTesting}
                className="w-full sm:w-auto rounded-xl bg-zinc-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {t.btn_start_exp}
              </button>
            </div>
          </div>
        )}

        {/* 2. TESTING STATE (20 SCENARIOS) */}
        {step === "TESTING" && scenarios.length > 0 && (
          <div className="w-full max-w-6xl space-y-6">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>{t.scenario_progress.replace("{current}", String(currentIndex + 1)).replace("{total}", String(scenarios.length))}</span>
              <span>{lang === "en" ? "In Progress..." : "Đang thực hiện..."}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-1.5 rounded-full bg-zinc-950 dark:bg-zinc-50 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
              />
            </div>

            {/* Motivational message banner */}
            {currentIndex === 4 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 font-semibold flex items-center gap-2 animate-fadeIn">
                <span>{t.tip_progress_5}</span>
              </div>
            )}
            {currentIndex === 9 && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400 font-semibold flex items-center gap-2 animate-fadeIn">
                <span>{t.tip_progress_10}</span>
              </div>
            )}
            {currentIndex === 14 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 dark:bg-amber-950/20 dark:border-emerald-900/40 dark:text-amber-400 font-semibold flex items-center gap-2 animate-fadeIn">
                <span>{t.trap_warning}</span>
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
                      lang={lang}
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
                          {t.ai_decision_title}
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
                              ? t.ai_decision_approve
                              : t.ai_decision_reject}
                          </span>
                          <span className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {t.ai_confidence}: {scenarios[currentIndex].ai_prediction.confidence_percent}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                        <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {t.xai_analysis_title}
                        </span>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-650 dark:text-zinc-350 font-medium">
                          {formatMarkdownBold(translateText(scenarios[currentIndex].shap_summary.text, lang))}
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
                      lang={lang}
                      shapFactors={scenarios[currentIndex].shap_summary.top_factors}
                    />
                  </div>

                  {/* Column 2: Shap Bar Chart (1/3 width) */}
                  <div 
                    className="lg:col-span-1"
                    onMouseEnter={() => handleHoverFeature("ShapBarChart")}
                  >
                    <ShapBarChart factors={scenarios[currentIndex].shap_summary.top_factors} lang={lang} />
                  </div>

                  {/* Column 3: AI Chatbot (1/3 width) */}
                  <div 
                    className="lg:col-span-1"
                    onMouseEnter={() => handleHoverFeature("AiChatbotCard")}
                  >
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col h-full min-h-[350px]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-zinc-500" />
                        {t.chatbot_title}
                      </h3>

                      {/* Chat messages history */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 p-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/40 text-xs scrollbar-thin max-h-[170px]">
                        {chatHistory.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 p-2 space-y-2">
                            <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-850" />
                            <p>{t.chatbot_placeholder_empty}</p>
                          </div>
                        ) : (
                          chatHistory.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                            >
                              <span className="text-[9px] text-zinc-450 dark:text-zinc-500 mb-0.5 uppercase tracking-wider font-semibold">
                                {msg.sender === "user" ? (lang === "en" ? "Underwriter" : "Chuyên viên") : (lang === "en" ? "AI Assistant" : "Trợ lý AI")}
                              </span>
                              <div
                                className={`rounded-lg px-2.5 py-1.5 max-w-[85%] leading-relaxed ${
                                  msg.sender === "user"
                                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-medium"
                                    : "bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                                }`}
                              >
                                {translateText(msg.text, lang)}
                              </div>
                            </div>
                          ))
                        )}
                        {chatLoading && (
                          <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.2s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.4s]" />
                            <span>{t.chatbot_loading}</span>
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
                              💡 {getTranslatedQuestion(qa.question)}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Text Input area */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <input
                          type="text"
                          disabled={chatLoading}
                          placeholder={t.chatbot_input_placeholder}
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
                          {t.chatbot_btn_send}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2.5: What-If Interactive Simulation (Counterfactual) */}
                {simProfile && (
                  <div 
                    className="w-full"
                    onMouseEnter={() => handleHoverFeature("WhatIfPanel")}
                  >
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-150 pb-3 dark:border-zinc-800/80 gap-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            {t.whatif_title}
                          </h3>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            {t.whatif_desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const p = scenarios[currentIndex].profile;
                            setSimProfile({
                              Age: p.Age,
                              MonthlyIncome: p.MonthlyIncome,
                              LoanAmount: p.LoanAmount,
                              CreditScore: p.CreditScore,
                              TotalDebtToIncomeRatio: p.TotalDebtToIncomeRatio,
                              PreviousLoanDefaults: p.PreviousLoanDefaults,
                              BankruptcyHistory: p.BankruptcyHistory,
                              EmploymentStatus: p.EmploymentStatus
                            });
                            setInteractiveClicks((prev) => prev + 1);
                          }}
                          className="rounded-lg border border-zinc-250 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:text-zinc-850 dark:hover:text-white transition-colors uppercase cursor-pointer"
                        >
                          {t.whatif_btn_reset}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        {/* Left: Inputs Sliders (2/3 width) */}
                        <div className="md:col-span-2 space-y-3.5 pr-2">
                          {/* Income Slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-650 dark:text-zinc-350">{t.feature_MonthlyIncome}</span>
                              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                {(simProfile.MonthlyIncome / 1000000).toLocaleString("vi-VN")}M {t.currency}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="10000000"
                              max="90000000"
                              step="1000000"
                              value={simProfile.MonthlyIncome}
                              onChange={(e) => handleSimChange("MonthlyIncome", parseInt(e.target.value))}
                              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-850 accent-zinc-950 dark:accent-zinc-50"
                            />
                          </div>

                          {/* Loan Amount Slider */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-650 dark:text-zinc-350">{t.feature_LoanAmount}</span>
                              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                {(simProfile.LoanAmount / 1000000).toLocaleString("vi-VN")}M {t.currency}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="50000000"
                              max="900000000"
                              step="10000000"
                              value={simProfile.LoanAmount}
                              onChange={(e) => handleSimChange("LoanAmount", parseInt(e.target.value))}
                              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-850 accent-zinc-950 dark:accent-zinc-50"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Credit Score Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-zinc-650 dark:text-zinc-350">{t.feature_CreditScore}</span>
                                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                  {simProfile.CreditScore} {t.points}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="300"
                                max="850"
                                step="1"
                                value={simProfile.CreditScore}
                                onChange={(e) => handleSimChange("CreditScore", parseInt(e.target.value))}
                                className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-850 accent-zinc-950 dark:accent-zinc-50"
                              />
                            </div>

                            {/* DTI Slider */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-zinc-650 dark:text-zinc-350">{t.feature_TotalDebtToIncomeRatio}</span>
                                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                  {Math.round(simProfile.TotalDebtToIncomeRatio * 100)}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={simProfile.TotalDebtToIncomeRatio}
                                onChange={(e) => handleSimChange("TotalDebtToIncomeRatio", parseFloat(e.target.value))}
                                className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-850 accent-zinc-950 dark:accent-zinc-50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Previous Defaults */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-zinc-650 dark:text-zinc-350">{t.feature_PreviousLoanDefaults}</span>
                                <span className="font-mono font-bold text-zinc-900 dark:text-white">{simProfile.PreviousLoanDefaults} {t.times}</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={simProfile.PreviousLoanDefaults}
                                onChange={(e) => handleSimChange("PreviousLoanDefaults", parseInt(e.target.value))}
                                className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-850 accent-zinc-950 dark:accent-zinc-50"
                              />
                            </div>

                            {/* Bankruptcy */}
                            <div className="space-y-1">
                              <span className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350">{t.feature_BankruptcyHistory}</span>
                              <select
                                value={simProfile.BankruptcyHistory}
                                onChange={(e) => handleSimChange("BankruptcyHistory", parseInt(e.target.value))}
                                className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs bg-transparent focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                              >
                                <option value="0" className="dark:bg-zinc-950">{t.bankruptcy_none}</option>
                                <option value="1" className="dark:bg-zinc-950">{t.bankruptcy_yes}</option>
                              </select>
                            </div>

                            {/* Employment */}
                            <div className="space-y-1">
                              <span className="block text-xs font-semibold text-zinc-650 dark:text-zinc-350">{t.feature_EmploymentStatus}</span>
                              <select
                                value={simProfile.EmploymentStatus}
                                onChange={(e) => handleSimChange("EmploymentStatus", e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs bg-transparent focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                              >
                                <option value="Employed" className="dark:bg-zinc-950">{t.employment_Employed}</option>
                                <option value="Self-Employed" className="dark:bg-zinc-950">{t.employment_Self_Employed}</option>
                                <option value="Unemployed" className="dark:bg-zinc-950">{t.employment_Unemployed}</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Right: Results Outputs (1/3 width) */}
                        <div className="rounded-xl border border-zinc-150 bg-zinc-50/50 p-4 dark:border-zinc-850 dark:bg-zinc-900/30 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                {t.whatif_sim_rec}
                              </span>
                              <div className="mt-1.5 flex items-center justify-between">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                    predictLoanApproval(simProfile).decision === "approve"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                                  }`}
                                >
                                  {predictLoanApproval(simProfile).decision === "approve" 
                                    ? (lang === "en" ? "APPROVE" : "DUYỆT VAY") 
                                    : (lang === "en" ? "REJECT" : "TỪ CHỐI")}
                                </span>
                                <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">
                                  {predictLoanApproval(simProfile).confidence_percent}%
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-zinc-200/60 pt-3 dark:border-zinc-800/60 text-[10px] text-zinc-500">
                              <span className="font-semibold block">{t.whatif_original_rec}:</span>
                              <span className="font-bold uppercase tracking-wider block mt-1">
                                {scenarios[currentIndex].ai_prediction.decision === "approve" 
                                  ? (lang === "en" ? "APPROVE" : "DUYỆT VAY") 
                                  : (lang === "en" ? "REJECT" : "TỪ CHỐI")} ({scenarios[currentIndex].ai_prediction.confidence_percent}%)
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] font-bold">
                            {predictLoanApproval(simProfile).decision !== scenarios[currentIndex].ai_prediction.decision ? (
                              <span className="text-amber-600 dark:text-amber-400 block animate-pulse">
                                {t.whatif_status_changed}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 block">
                                {t.whatif_status_same}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Row 3: Technical Details Row (Math Matrix correlations & metrics) */}
                <div 
                  className="w-full"
                  onMouseEnter={() => handleHoverFeature("MathMatrixView")}
                >
                  <MathMatrixView
                    decision={scenarios[currentIndex].ai_prediction.decision}
                    confidencePercent={scenarios[currentIndex].ai_prediction.confidence_percent}
                    factors={scenarios[currentIndex].shap_summary.top_factors}
                    lang={lang}
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
                    lang={lang}
                    shapFactors={group === "B" ? scenarios[currentIndex].shap_summary.top_factors : undefined}
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
                      {t.ai_decision_title}
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
                          ? t.ai_decision_approve
                          : t.ai_decision_reject}
                      </span>
                      <span className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {t.ai_confidence}: {scenarios[currentIndex].ai_prediction.confidence_percent}%
                      </span>
                    </div>

                    {/* Group B: Explanations text */}
                    {group !== "A" && (
                      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                        <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {t.xai_analysis_title}
                        </span>
                        <p className="mt-2 text-xs leading-relaxed text-zinc-650 dark:text-zinc-350 font-medium">
                          {formatMarkdownBold(translateText(scenarios[currentIndex].shap_summary.text, lang))}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Group B: Shap Diverging Bar Chart */}
                  {group !== "A" && (
                    <div onMouseEnter={() => handleHoverFeature("ShapBarChart")}>
                      <ShapBarChart factors={scenarios[currentIndex].shap_summary.top_factors} lang={lang} />
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
                        {t.help_title}
                      </h4>
                      <ul className="text-xs text-zinc-550 space-y-2 list-disc list-inside leading-relaxed">
                        {[t.sidebar_tip_1, t.sidebar_tip_2, t.sidebar_tip_3].map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-8 border-t border-zinc-200/60 pt-4 text-[10px] text-zinc-400 dark:border-zinc-805">
                      {lang === "en" ? "The experiment session is secure and response times are automatically tracked." : "Phiên thí nghiệm được bảo mật và tự động ghi lại thời gian thực hiện."}
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
                {t.btn_disagree_ai}
              </button>
              <button
                onClick={() => handleUserDecision("agree")}
                disabled={loading}
                className="rounded-xl bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800"
              >
                {t.btn_agree_ai}
              </button>
            </div>

            {/* Developer Feedback Area */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 border-t border-zinc-200/80 pt-4 dark:border-zinc-805 text-left">
                <label className="block text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {lang === "en" ? "DEV ONLY: Scenario Feedback (Saves to local JSON)" : "Dành cho DEV: Ý kiến phản hồi tình huống (Lưu vào file JSON)"}
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={lang === "en" ? "e.g. Check spelling or adjust AI decision confidence" : "Ví dụ: Điều chỉnh độ tin cậy AI hoặc sửa lỗi chính tả..."}
                    value={devFeedbackText}
                    onChange={(e) => setDevFeedbackText(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-200 px-3.5 py-2 text-xs focus:border-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={handleSendDevFeedback}
                    disabled={!devFeedbackText.trim() || devFeedbackStatus === "sending"}
                    className="rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-4 py-2 text-xs font-bold transition-colors disabled:bg-zinc-300 dark:disabled:bg-zinc-800"
                  >
                    {devFeedbackStatus === "sending" ? (lang === "en" ? "Saving..." : "Đang lưu...") : (lang === "en" ? "Save Comment" : "Lưu phản hồi")}
                  </button>
                </div>
                {devFeedbackStatus === "success" && (
                  <span className="block mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-fadeIn">
                    ✓ {lang === "en" ? "Feedback saved to scenario_feedback.json" : "Đã lưu phản hồi vào file scenario_feedback.json"}
                  </span>
                )}
                {devFeedbackStatus === "error" && (
                  <span className="block mt-1 text-[11px] text-rose-600 dark:text-rose-450 font-semibold animate-fadeIn">
                    ✗ {lang === "en" ? "Failed to save feedback" : "Lưu phản hồi thất bại"}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. SURVEY STATE (NASA-TLX) */}
        {step === "SURVEY" && (
          <NasaTlxSurvey onSubmit={handleSurveySubmit} isSubmitting={loading} lang={lang} />
        )}

        {/* 4. FINISHED STATE */}
        {step === "FINISHED" && (
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {t.finish_title}
            </h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              {t.finish_desc}
            </p>

            {/* Optional Feedback form */}
            {!feedbackSubmitted ? (
              <div className="mt-6 border-t border-zinc-100 pt-6 text-left dark:border-zinc-800/80">
                <label className="block text-[11px] font-semibold text-zinc-650 dark:text-zinc-350 uppercase tracking-wider">
                  {t.finish_feedback_label}
                </label>
                <textarea
                  placeholder={t.finish_feedback_placeholder}
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
                  {loading ? (lang === "en" ? "Sending..." : "Đang gửi...") : t.btn_submit_feedback}
                </button>
              </div>
            ) : (
              <div className="mt-6 border-t border-zinc-100 pt-6 text-xs text-emerald-600 dark:border-zinc-850/80 dark:text-emerald-400 font-semibold">
                {t.feedback_success}
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <a
                href="/docs"
                className="rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                {lang === "en" ? "View API Docs (Swagger UI)" : "Xem tài liệu API (Swagger UI)"}
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950">
        <span>© {new Date().getFullYear()} {lang === "en" ? "HCI & Explainable AI (XAI) Research Project" : "Đề tài Nghiên cứu HCI & Explainable AI (XAI)"}</span>
      </footer>
    </div>
  );
}
