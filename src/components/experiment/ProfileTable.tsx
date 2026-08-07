import React from "react";
import { HelpCircle } from "lucide-react";
import { FEATURES_METADATA } from "@/lib/features";
import translations from "@/data/translations.json";

interface ProfileTableProps {
  profile: Record<string, any>;
  onHoverFeature?: (featureKey: string) => void;
  lang?: "vi" | "en";
  shapFactors?: Array<{ feature: string; impact: number; direction: "positive" | "negative" }>;
}
 
const TOOLTIPS_VI: Record<string, string> = {
  Age: "Độ tuổi của người xin vay vốn.",
  MonthlyIncome: "Thu nhập hàng tháng thực tế (VND). Thu nhập cao giúp tăng khả năng thanh toán nợ.",
  LoanAmount: "Số tiền vay tín dụng đang yêu cầu phê duyệt.",
  CreditScore: "Điểm tín dụng FICO (300-850). <579: Yếu (Rủi ro rất cao); 580-669: Trung bình; 670-739: Tốt; 740+: Rất tốt.",
  TotalDebtToIncomeRatio: "Tỷ lệ nợ trên thu nhập (DTI). Ngưỡng an toàn là dưới 35%. Trên 50% cảnh báo rủi ro mất khả năng trả nợ.",
  PreviousLoanDefaults: "Số lần nợ quá hạn/nợ xấu trước đây. Có từ 1 lần trở lên là điểm trừ nghiêm trọng, >=3 lần thường bị từ chối vay ngay lập tức.",
  BankruptcyHistory: "Lịch sử đã từng phá sản. Khách hàng đã từng phá sản thuộc nhóm rủi ro đặc biệt cao.",
  EmploymentStatus: "Tình trạng việc làm hiện tại. Nhân viên chính thức (Employed) có thu nhập ổn định nhất; Tự doanh (Self-Employed) trung bình; Thất nghiệp (Unemployed) rủi ro cao nhất."
};
 
const TOOLTIPS_EN: Record<string, string> = {
  Age: "Applicant's age.",
  MonthlyIncome: "Actual monthly income (VND). Higher income indicates lower repayment risk.",
  LoanAmount: "Requested loan credit amount.",
  CreditScore: "FICO credit score (300-850). <579: Poor (Very high risk); 580-669: Fair; 670-739: Good; 740+: Excellent.",
  TotalDebtToIncomeRatio: "Debt-to-Income (DTI) ratio. Safe threshold is below 35%. Over 50% warns of high default risk.",
  PreviousLoanDefaults: "Number of past loan defaults/overdue events. 1 or more is a serious negative factor; >=3 defaults usually lead to immediate rejection.",
  BankruptcyHistory: "History of bankruptcy. Applicants with bankruptcy records are classified as extremely high risk.",
  EmploymentStatus: "Current employment status. Fully employed (Employed) has the most stable income; self-employed is medium; unemployed has the highest default risk."
};
 
export default function ProfileTable({ profile, onHoverFeature, lang = "vi", shapFactors }: ProfileTableProps) {
  const t = (translations as any)[lang];
 
  // Features to display in order
  const displayKeys = [
    "Age",
    "MonthlyIncome",
    "LoanAmount",
    "CreditScore",
    "TotalDebtToIncomeRatio",
    "PreviousLoanDefaults",
    "BankruptcyHistory",
    "EmploymentStatus",
  ];
 
  const formatVal = (key: string, val: any) => {
    if (key === "Age") return `${val} ${t.years}`;
    if (key === "MonthlyIncome" || key === "LoanAmount") {
      const num = Number(val);
      return num.toLocaleString(lang === "vi" ? "vi-VN" : "en-US") + ` ${t.currency}`;
    }
    if (key === "CreditScore") return `${val} ${t.points}`;
    if (key === "TotalDebtToIncomeRatio") return `${Math.round(val * 100)}%`;
    if (key === "PreviousLoanDefaults") return `${val} ${t.times}`;
    if (key === "BankruptcyHistory") return Number(val) === 1 ? t.bankruptcy_yes : t.bankruptcy_none;
    if (key === "EmploymentStatus") {
      if (val === "Employed") return `${t.employment_Employed}`;
      if (val === "Self-Employed") return `${t.employment_Self_Employed}`;
      if (val === "Unemployed") return `${t.employment_Unemployed}`;
      return String(val);
    }
    return String(val);
  };
 
  const getRating = (key: string, val: any, prof: Record<string, any>) => {
    if (key === "Age") {
      const age = Number(val);
      if (age < 25) return { label: lang === "en" ? "Fair" : "Tạm ổn", color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400" };
      return { label: lang === "en" ? "Good" : "Tốt", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-amber-400" };
    }
    if (key === "MonthlyIncome") {
      const inc = Number(val);
      if (inc < 15000000) return { label: lang === "en" ? "Low" : "Thấp", color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450" };
      if (inc < 30000000) return { label: lang === "en" ? "Fair" : "Tạm ổn", color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400" };
      return { label: lang === "en" ? "Good" : "Tốt", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400" };
    }
    if (key === "LoanAmount") {
      const loan = Number(val);
      const inc = Number(prof.MonthlyIncome) || 1;
      const ratio = loan / inc;
      if (ratio > 10) return { label: lang === "en" ? "High" : "Cao", color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450" };
      if (ratio > 5) return { label: lang === "en" ? "Fair" : "Tạm ổn", color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400" };
      return { label: lang === "en" ? "Low" : "Thấp", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400" };
    }
    if (key === "CreditScore") {
      const score = Number(val);
      if (score < 580) return { label: lang === "en" ? "Bad" : "Tệ", color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450" };
      if (score < 670) return { label: lang === "en" ? "Fair" : "Tạm ổn", color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400" };
      return { label: lang === "en" ? "Good" : "Tốt", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400" };
    }
    if (key === "TotalDebtToIncomeRatio") {
      const dti = Number(val);
      if (dti > 0.40) return { label: lang === "en" ? "High" : "Cao", color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450" };
      if (dti > 0.25) return { label: lang === "en" ? "Fair" : "Tạm ổn", color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400" };
      return { label: lang === "en" ? "Good" : "Tốt", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400" };
    }
    if (key === "PreviousLoanDefaults") {
      const def = Number(val);
      if (def > 0) return { label: lang === "en" ? "Bad" : "Tệ", color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450" };
      return { label: lang === "en" ? "Good" : "Tốt", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400" };
    }
    if (key === "BankruptcyHistory") {
      const bank = Number(val);
      if (bank > 0) return { label: lang === "en" ? "Bad" : "Tệ", color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450" };
      return { label: lang === "en" ? "Good" : "Tốt", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400" };
    }
    if (key === "EmploymentStatus") {
      const status = String(val);
      if (status === "Unemployed") return { label: lang === "en" ? "Bad" : "Tệ", color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450" };
      if (status === "Self-Employed") return { label: lang === "en" ? "Fair" : "Tạm ổn", color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400" };
      return { label: lang === "en" ? "Good" : "Tốt", color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400" };
    }
    return null;
  };
 
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800/50 dark:bg-zinc-900/50">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {lang === "en" ? "Client Credit Profile" : "Thông tin Hồ sơ Tín dụng"}
        </h3>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {displayKeys.map((key) => {
          const meta = FEATURES_METADATA[key];
          if (!meta) return null;
          const val = profile[key];
          const labelText = t[`feature_${key}`] || meta.label;
          const tooltipText = lang === "en" ? TOOLTIPS_EN[key] : TOOLTIPS_VI[key];
          const rating = getRating(key, val, profile);
          
          const factor = shapFactors?.find((f) => f.feature === key);
          const impactPct = factor ? Math.round(factor.impact * 100) : null;
 
          return (
            <div
              key={key}
              onMouseEnter={() => onHoverFeature && onHoverFeature(key)}
              className="group relative flex items-center justify-between px-4 py-3.5 text-xs hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
            >
              {/* Feature label with tooltip indicator */}
              <div className="flex items-center gap-1.5 cursor-help">
                <span className="font-medium text-zinc-500 dark:text-zinc-400">
                  {labelText}
                </span>
                <HelpCircle className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-700 transition-colors group-hover:text-zinc-500 dark:group-hover:text-zinc-400" />
              </div>
 
              {/* Feature value & Rating badge & SHAP weight */}
              <div className="flex items-center gap-2">
                {rating && (
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold border ${rating.color}`}>
                    {rating.label}
                  </span>
                )}
                {impactPct !== null && impactPct !== 0 && (
                  <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-mono font-bold ${impactPct >= 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-250/20" : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-250/20"}`}>
                    {impactPct >= 0 ? `+${impactPct}%` : `${impactPct}%`}
                  </span>
                )}
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatVal(key, val)}
                </span>
              </div>

              {/* Hover Tooltip Box */}
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-4 right-4 -top-8 z-30 rounded-lg border border-zinc-950/5 bg-zinc-950 px-3 py-2 text-[10px] text-zinc-50 shadow-md transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 pointer-events-none -translate-y-2">
                <div className="relative">
                  <span className="font-bold text-zinc-200 dark:text-zinc-300 block mb-0.5">
                    {labelText}
                  </span>
                  {tooltipText}
                  <div className="absolute left-4 -bottom-3 h-2 w-2 rotate-45 bg-zinc-950 dark:bg-zinc-900" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
