import React from "react";
import { FEATURES_METADATA } from "@/lib/features";

interface ProfileTableProps {
  profile: Record<string, any>;
}

export default function ProfileTable({ profile }: ProfileTableProps) {
  // Features to display in order
  const displayKeys = [
    "age",
    "experience_years",
    "income_million_vnd",
    "loan_amount_million_vnd",
    "loan_term_months",
    "bad_debt_group",
    "debt_to_income_ratio",
    "loan_purpose",
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800/50 dark:bg-zinc-900/50">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Thông tin Hồ sơ Tín dụng
        </h3>
      </div>
      <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
        <tbody>
          {displayKeys.map((key, index) => {
            const meta = FEATURES_METADATA[key];
            const rawVal = profile[key];
            const formattedVal = meta ? meta.format(rawVal) : String(rawVal);

            return (
              <tr
                key={key}
                className={`border-b border-zinc-100 last:border-0 dark:border-zinc-800/80 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors`}
              >
                <td className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-500">
                  {meta ? meta.label : key}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                  {formattedVal}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
