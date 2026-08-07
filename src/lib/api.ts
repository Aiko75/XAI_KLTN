export interface Scenario {
  scenario_id: number;
  scenario_type: "normal" | "trap" | "attention_check";
  profile: {
    Age: number;
    MonthlyIncome: number;
    LoanAmount: number;
    CreditScore: number;
    TotalDebtToIncomeRatio: number;
    PreviousLoanDefaults: number;
    BankruptcyHistory: number;
    EmploymentStatus: string;
  };
  ai_prediction: {
    decision: "approve" | "reject";
    confidence_percent: number;
  };
  ground_truth: {
    decision: "approve" | "reject";
    note: string;
  };
  shap_summary: {
    text: string;
    top_factors: Array<{
      feature: string;
      impact: number;
      direction: "positive" | "negative";
    }>;
  };
  interactive_qa?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface StartUserResponse {
  user_id: string;
  group_assigned: "A" | "B" | "C";
}

export async function fetchScenarios(): Promise<Scenario[]> {
  const res = await fetch("/api/scenarios");
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch scenarios");
  }
  const data = await res.json();
  return data.scenarios;
}

export async function startUser(
  name: string, 
  studentCode: string, 
  major: string, 
  aiFrequency: string,
  ageGroup: string,
  device: string
): Promise<StartUserResponse> {
  const res = await fetch("/api/users/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      name, 
      student_code: studentCode,
      major,
      ai_frequency: aiFrequency,
      age_group: ageGroup,
      device: device
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to initialize user session");
  }
  return res.json();
}

export async function saveResponse(payload: {
  user_id: string;
  scenario_id: number;
  user_decision: "agree" | "reject";
  time_spent_seconds: number;
  is_correct_on_error_case: boolean | null;
  hover_count?: number;
  hover_details?: string;
  chat_count?: number;
  chat_history?: string;
  interactive_clicks?: number;
  telemetry_data?: string;
}): Promise<void> {
  const res = await fetch("/api/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to save response log");
  }
}

export async function saveSurvey(user_id: string, nasa_tlx: Record<string, number>): Promise<void> {
  const res = await fetch("/api/survey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, nasa_tlx }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to save survey answers");
  }
}

export async function finishUser(user_id: string, tutorial_time_seconds?: number): Promise<void> {
  const res = await fetch(`/api/users/${user_id}/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tutorial_time_seconds }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to finalize user session");
  }
}

export async function saveFeedback(user_id: string, feedback: string): Promise<void> {
  const res = await fetch(`/api/users/${user_id}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedback }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to save feedback");
  }
}

