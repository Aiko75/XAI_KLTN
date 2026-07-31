export interface FeatureMetadata {
  key: string;
  label: string;
  unit: string;
  format: (value: any) => string;
  color: string;
}

// Map the 8 features from the Kaggle dataset
export const FEATURES_METADATA: Record<string, FeatureMetadata> = {
  Age: {
    key: "Age",
    label: "Tuổi",
    unit: "tuổi",
    format: (val) => `${val} tuổi`,
    color: "#6366f1", // indigo
  },
  MonthlyIncome: {
    key: "MonthlyIncome",
    label: "Thu nhập hàng tháng",
    unit: "VND",
    format: (val) => {
      const num = Number(val);
      return num.toLocaleString("vi-VN") + " đ";
    },
    color: "#10b981", // emerald
  },
  LoanAmount: {
    key: "LoanAmount",
    label: "Số tiền vay",
    unit: "VND",
    format: (val) => {
      const num = Number(val);
      return num.toLocaleString("vi-VN") + " đ";
    },
    color: "#f59e0b", // amber
  },
  CreditScore: {
    key: "CreditScore",
    label: "Điểm tín dụng",
    unit: "điểm",
    format: (val) => `${val} điểm`,
    color: "#0ea5e9", // sky
  },
  TotalDebtToIncomeRatio: {
    key: "TotalDebtToIncomeRatio",
    label: "Tỷ lệ DTI",
    unit: "%",
    format: (val) => `${Math.round(val * 100)}%`,
    color: "#ec4899", // pink
  },
  PreviousLoanDefaults: {
    key: "PreviousLoanDefaults",
    label: "Số lần nợ xấu",
    unit: "lần",
    format: (val) => `${val} lần`,
    color: "#ef4444", // red
  },
  BankruptcyHistory: {
    key: "BankruptcyHistory",
    label: "Lịch sử phá sản",
    unit: "",
    format: (val) => (Number(val) === 1 ? "Đã từng phá sản (Có)" : "Không có lịch sử phá sản"),
    color: "#a855f7", // purple
  },
  EmploymentStatus: {
    key: "EmploymentStatus",
    label: "Tình trạng việc làm",
    unit: "",
    format: (val) => {
      if (val === "Employed") return "Làm công ăn lương (Employed)";
      if (val === "Self-Employed") return "Tự doanh (Self-Employed)";
      if (val === "Unemployed") return "Thất nghiệp (Unemployed)";
      return String(val);
    },
    color: "#14b8a6", // teal
  },
};
