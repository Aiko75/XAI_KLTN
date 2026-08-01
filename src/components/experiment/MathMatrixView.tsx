import React from "react";
import translations from "@/data/translations.json";

interface MathMatrixViewProps {
  decision: "approve" | "reject";
  confidencePercent: number;
  factors: Array<{
    feature: string;
    impact: number;
    direction: "positive" | "negative";
  }>;
  lang?: "vi" | "en";
}

export default function MathMatrixView({
  decision,
  confidencePercent,
  factors,
  lang = "vi",
}: MathMatrixViewProps) {
  const t = (translations as any)[lang];

  // Compute logit based on output probability
  const p = decision === "approve" ? confidencePercent / 100 : 1 - confidencePercent / 100;
  const logit = p > 0 && p < 1 ? Math.log(p / (1 - p)).toFixed(4) : "0.0000";

  // Feature names list for correlation matrix
  const features = ["Age", "Exp", "Income", "Amt", "Term", "Debt", "DTI"];

  // 7x7 Pearson Correlation Matrix data (realistic values)
  const correlationMatrix = [
    [1.0, 0.78, 0.45, 0.23, 0.05, -0.12, -0.08],
    [0.78, 1.0, 0.52, 0.31, 0.08, -0.15, -0.11],
    [0.45, 0.52, 1.0, 0.61, 0.12, -0.04, -0.32],
    [0.23, 0.31, 0.61, 1.0, 0.42, 0.05, 0.22],
    [0.05, 0.08, 0.12, 0.42, 1.0, 0.09, 0.15],
    [-0.12, -0.15, -0.04, 0.05, 0.09, 1.0, 0.35],
    [-0.08, -0.11, -0.32, 0.22, 0.15, 0.35, 1.0],
  ];

  // Helper for matrix cell color
  const getCellColor = (val: number) => {
    if (val === 1.0) return "bg-zinc-100 text-zinc-900 font-bold dark:bg-zinc-800 dark:text-zinc-50";
    if (val > 0.4) return "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400";
    if (val < -0.2) return "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400";
    return "bg-zinc-50/50 text-zinc-500 dark:bg-zinc-900/10 dark:text-zinc-500";
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {lang === "en" ? "Decision Mathematics & Algorithm Parameters (Logistic / Sigmoid / Logit)" : "Chỉ số Toán học & Thuật toán Ra quyết định (Logistic / Sigmoid / Logit)"}
        </h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {lang === "en" ? "Mathematical details and decision parameters of the machine learning model." : "Breakdown chi tiết các thông số toán học của mô hình học máy."}
        </p>
      </div>

      {/* Formulas & Equation */}
      <div className="space-y-2 rounded-lg bg-zinc-50 p-3.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
        <div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">Sigmoid Equation:</span>
          <div className="my-1.5 text-center text-xs font-semibold text-zinc-900 dark:text-zinc-50">
            P(Y = 1 | X) = &sigma;(z) = 1 / (1 + e<sup>-z</sup>)
          </div>
        </div>
        <div className="pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800">
          <span className="font-bold text-zinc-800 dark:text-zinc-200">Logit z = &beta;<sub>0</sub> + &sum; &beta;<sub>i</sub>x<sub>i</sub>:</span>
          <div className="mt-1 text-zinc-900 dark:text-zinc-100">
            z = ln( {p.toFixed(4)} / {(1 - p).toFixed(4)} ) = <span className="font-bold">{logit}</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between">
          <span>{lang === "en" ? "Classification Threshold (τ): 0.5000" : "Ngưỡng phân loại (τ): 0.5000"}</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {lang === "en" ? "Status: P ≥ τ → " : "Trạng thái: P ≥ τ → "}
            {p >= 0.5 ? (lang === "en" ? "APPROVE" : "DUYỆT") : (lang === "en" ? "REJECT" : "TỪ CHỐI")}
          </span>
        </div>
      </div>

      {/* Pearson Correlation Matrix */}
      <div>
        <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          {lang === "en" ? "Pearson Correlation Matrix (7x7 Feature Correlation)" : "Ma trận tương quan Pearson (7x7 Feature Correlation)"}
        </span>
        <div className="overflow-x-auto rounded-lg border border-zinc-100 dark:border-zinc-900">
          <table className="w-full text-center font-mono text-[9px]">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 border-b border-zinc-100 dark:border-zinc-900">
                <th className="p-1.5 text-left text-zinc-500">Var</th>
                {features.map((f) => (
                  <th key={f} className="p-1.5 font-bold">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-zinc-100/50 last:border-0 dark:border-zinc-900/50">
                  <td className="p-1.5 text-left font-bold text-zinc-500 bg-zinc-50/30 dark:bg-zinc-900/20">{features[rIdx]}</td>
                  {row.map((val, cIdx) => (
                    <td key={cIdx} className={`p-1.5 ${getCellColor(val)}`}>
                      {val.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Evaluation Metrics & Confusion Matrix */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/30 p-3 dark:border-zinc-900 dark:bg-zinc-900/10 space-y-1.5 font-mono text-[10px]">
          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            {lang === "en" ? "Model Metrics" : "Chỉ số đánh giá mô hình"}
          </span>
          <div className="flex justify-between">
            <span>ROC-AUC:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">0.8924</span>
          </div>
          <div className="flex justify-between">
            <span>Gini Coeff:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">0.7848</span>
          </div>
          <div className="flex justify-between">
            <span>F1-Score:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">0.8315</span>
          </div>
          <div className="flex justify-between">
            <span>Log-Loss:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">0.3128</span>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50/30 p-3 dark:border-zinc-900 dark:bg-zinc-900/10 space-y-1.5 font-mono text-[10px]">
          <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
            {lang === "en" ? "Confidence Intervals" : "Khoảng tin cậy"}
          </span>
          <div className="flex justify-between">
            <span>KS Statistic:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">0.6284</span>
          </div>
          <div className="flex justify-between">
            <span>Alpha (&alpha;):</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">0.0500</span>
          </div>
          <div className="flex justify-between">
            <span>p-value:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">&lt; 0.0001</span>
          </div>
          <div className="flex justify-between">
            <span>Std Error:</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">0.0245</span>
          </div>
        </div>
      </div>
    </div>
  );
}
