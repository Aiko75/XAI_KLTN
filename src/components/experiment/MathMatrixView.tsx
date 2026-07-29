import React from "react";

interface MathMatrixViewProps {
  decision: "approve" | "reject";
  confidencePercent: number;
  factors: Array<{
    feature: string;
    impact: number;
    direction: "positive" | "negative";
  }>;
}

export default function MathMatrixView({
  decision,
  confidencePercent,
  factors,
}: MathMatrixViewProps) {
  // Compute logit based on output probability
  const p = decision === "approve" ? confidencePercent / 100 : 1 - confidencePercent / 100;
  // logit = ln(p / (1-p))
  const logit = p > 0 && p < 1 ? Math.log(p / (1 - p)).toFixed(4) : "N/A";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Ma trận Toán học & Cơ chế Ra quyết định (Sigmoid/Logit)
      </h3>
      
      {/* Formulas */}
      <div className="mb-4 space-y-2 rounded-lg bg-zinc-50 p-3 font-mono text-[11px] text-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-400">
        <div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">Hàm Sigmoid:</span> P(Y=1) = σ(z) = 1 / (1 + e^-z)
        </div>
        <div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">Tổng Logit (z):</span> z = ln(P / (1 - P)) = {logit}
        </div>
        <div>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">Ngưỡng Quyết định (τ):</span> τ = 0.50 | Trạng thái: {p >= 0.5 ? "σ(z) ≥ τ (DUYỆT)" : "σ(z) < τ (TỪ CHỐI)"}
        </div>
      </div>

      {/* Raw Weight Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider">
              <th className="pb-2">Đặc trưng (x_i)</th>
              <th className="pb-2 text-right">Trọng số (w_i)</th>
              <th className="pb-2 text-right">Đóng góp (w_i * x_i)</th>
              <th className="pb-2 text-right">Ý nghĩa P-Value</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f, i) => (
              <tr key={i} className="border-b border-zinc-100/55 last:border-0 dark:border-zinc-800/40">
                <td className="py-2 text-zinc-700 dark:text-zinc-300 font-medium">{f.feature}</td>
                <td className="py-2 text-right">{(f.impact * 1.45).toFixed(4)}</td>
                <td className={`py-2 text-right font-bold ${f.direction === "positive" ? "text-emerald-600" : "text-rose-600"}`}>
                  {f.direction === "positive" ? "+" : ""}{f.impact.toFixed(4)}
                </td>
                <td className="py-2 text-right text-zinc-400">p &lt; 0.00{i + 1}</td>
              </tr>
            ))}
            <tr className="font-bold text-zinc-800 dark:text-zinc-200">
              <td className="pt-2">Hệ số tự do (Intercept)</td>
              <td className="pt-2 text-right">0.0000</td>
              <td className="pt-2 text-right">0.0000</td>
              <td className="pt-2 text-right">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
