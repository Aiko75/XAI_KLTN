import rfModel from "@/data/rf_model.json";

interface TreeNode {
  is_leaf: boolean;
  value?: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

interface RandomForestModel {
  feature_names: string[];
  estimators: TreeNode[];
}

function predictTree(node: TreeNode, features: number[]): number {
  if (node.is_leaf) {
    return node.value ?? 0.0;
  }
  
  const featureIdx = node.feature;
  const threshold = node.threshold;
  
  if (featureIdx === undefined || threshold === undefined || !node.left || !node.right) {
    return 0.0;
  }
  
  const featureVal = features[featureIdx];
  if (featureVal <= threshold) {
    return predictTree(node.left, features);
  } else {
    return predictTree(node.right, features);
  }
}

export function predictLoanApproval(profile: {
  Age: number;
  MonthlyIncome: number; // in VND
  LoanAmount: number;    // in VND
  CreditScore: number;
  TotalDebtToIncomeRatio: number;
  PreviousLoanDefaults: number;
  BankruptcyHistory: number;
  EmploymentStatus: string; // "Employed" | "Self-Employed" | "Unemployed"
}): { decision: "approve" | "reject"; confidence_percent: number } {
  // 1. Convert EmploymentStatus to encoded value
  let empEncoded = 1; // Default: Employed
  if (profile.EmploymentStatus === "Unemployed") {
    empEncoded = 0;
  } else if (profile.EmploymentStatus === "Self-Employed") {
    empEncoded = 2;
  }

  // 2. Construct feature array in the exact training order:
  // 0: Age
  // 1: MonthlyIncome_VND
  // 2: LoanAmount_VND
  // 3: CreditScore
  // 4: TotalDebtToIncomeRatio
  // 5: PreviousLoanDefaults
  // 6: BankruptcyHistory
  // 7: EmploymentStatus_encoded
  const X = [
    profile.Age,
    profile.MonthlyIncome,
    profile.LoanAmount,
    profile.CreditScore,
    profile.TotalDebtToIncomeRatio,
    profile.PreviousLoanDefaults,
    profile.BankruptcyHistory,
    empEncoded
  ];

  // 3. Sum up tree probabilities
  let sumProb = 0;
  const trees = (rfModel as RandomForestModel).estimators;
  
  for (const tree of trees) {
    sumProb += predictTree(tree, X);
  }

  // 4. Calculate average approval probability
  const avgProb = sumProb / trees.length;

  // 5. Output decision and confidence
  const decision = avgProb >= 0.5 ? "approve" : "reject";
  const confidence = decision === "approve" ? avgProb : 1.0 - avgProb;
  const confidence_percent = Math.round(confidence * 100);

  return {
    decision,
    confidence_percent
  };
}
