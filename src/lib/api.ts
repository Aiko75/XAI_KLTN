export interface Scenario {
  scenario_id: number;
  scenario_type: "normal" | "trap" | "attention_check";
  profile: {
    age: number;
    experience_years: number;
    income_million_vnd: number;
    loan_amount_million_vnd: number;
    loan_term_months: number;
    bad_debt_group: number;
    late_payment_count: number;
    debt_to_income_ratio: number;
    loan_purpose: string;
    credit_score: number;
    employment_stability: number;
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

export async function startUser(name: string, studentCode: string): Promise<StartUserResponse> {
  const res = await fetch("/api/users/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, student_code: studentCode }),
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

export async function finishUser(user_id: string): Promise<void> {
  const res = await fetch(`/api/users/${user_id}/finish`, {
    method: "POST",
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

