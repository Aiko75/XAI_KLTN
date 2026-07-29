export interface FeatureMetadata {
  key: string;
  label: string;
  unit: string;
  format: (value: any) => string;
  color: string;
}

export const FEATURES_METADATA: Record<string, FeatureMetadata> = {
  age: {
    key: "age",
    label: "Tuổi",
    unit: "tuổi",
    format: (val) => `${val} tuổi`,
    color: "#6366f1", // indigo
  },
  experience_years: {
    key: "experience_years",
    label: "Thâm niên công tác",
    unit: "năm",
    format: (val) => `${val} năm`,
    color: "#0ea5e9", // sky
  },
  income_million_vnd: {
    key: "income_million_vnd",
    label: "Thu nhập hàng tháng",
    unit: "triệu VNĐ",
    format: (val) => `${val} triệu VNĐ`,
    color: "#10b981", // emerald
  },
  loan_amount_million_vnd: {
    key: "loan_amount_million_vnd",
    label: "Số tiền vay",
    unit: "triệu VNĐ",
    format: (val) => `${val} triệu VNĐ`,
    color: "#f59e0b", // amber
  },
  loan_term_months: {
    key: "loan_term_months",
    label: "Thời hạn vay",
    unit: "tháng",
    format: (val) => `${val} tháng`,
    color: "#a855f7", // purple
  },
  bad_debt_group: {
    key: "bad_debt_group",
    label: "Lịch sử nợ xấu",
    unit: "",
    format: (val) => {
      const num = Number(val);
      if (num === 1) return "Nhóm 1 (Tốt)";
      if (num === 2) return "Nhóm 2 (Chú ý)";
      if (num === 3) return "Nhóm 3 (Dưới tiêu chuẩn)";
      if (num === 4) return "Nhóm 4 (Nghi ngờ)";
      if (num === 5) return "Nhóm 5 (Mất vốn)";
      return `Nhóm ${val}`;
    },
    color: "#ef4444", // red
  },
  debt_to_income_ratio: {
    key: "debt_to_income_ratio",
    label: "Tỷ lệ DTI (Nợ trên thu nhập)",
    unit: "%",
    format: (val) => `${Math.round(val * 100)}%`,
    color: "#ec4899", // pink
  },
  loan_purpose: {
    key: "loan_purpose",
    label: "Mục đích vay",
    unit: "",
    format: (val) => String(val),
    color: "#14b8a6", // teal
  },
};
