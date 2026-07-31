import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import shap

# 1. Load the dataset
csv_path = r"d:\My_projects\XAI_KLTN\data\2nd test\Financial Risk for Loan Approval.csv"
if not os.path.exists(csv_path):
    raise FileNotFoundError(f"Dataset not found at: {csv_path}")

print("Loading dataset...")
df = pd.read_csv(csv_path)
print(f"Dataset shape: {df.shape}")

# 2. Scale MonthlyIncome and LoanAmount to realistic Vietnamese credit levels
# MonthlyIncome: 10M to 90M VND
inc_min = df["MonthlyIncome"].min()
inc_max = df["MonthlyIncome"].max()
df["MonthlyIncome_VND"] = 10000000 + (df["MonthlyIncome"] - inc_min) / (inc_max - inc_min) * 80000000

# LoanAmount: 50M to 900M VND
loan_min = df["LoanAmount"].min()
loan_max = df["LoanAmount"].max()
df["LoanAmount_VND"] = 50000000 + (df["LoanAmount"] - loan_min) / (loan_max - loan_min) * 850000000

# Encode EmploymentStatus for ML
employment_mapping = {"Unemployed": 0, "Employed": 1, "Self-Employed": 2}
df["EmploymentStatus_encoded"] = df["EmploymentStatus"].map(employment_mapping)

# Prepare features matrix X and target vector y
X_cols = [
    "Age",
    "MonthlyIncome_VND",
    "LoanAmount_VND",
    "CreditScore",
    "TotalDebtToIncomeRatio",
    "PreviousLoanDefaults",
    "BankruptcyHistory",
    "EmploymentStatus_encoded"
]
X = df[X_cols]
y = df["LoanApproved"]

# Train / Test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 3. Train RandomForest model
print("Training RandomForest model...")
model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
model.fit(X_train, y_train)

# Evaluate
train_acc = model.score(X_train, y_train)
test_acc = model.score(X_test, y_test)
print(f"Train Accuracy: {train_acc:.4f}")
print(f"Test Accuracy: {test_acc:.4f}")

# 4. Predict probabilities on the full dataset
df["y_prob"] = model.predict_proba(X)[:, 1]
df["y_pred"] = (df["y_prob"] >= 0.5).astype(int)
df["is_error"] = df["y_pred"] != df["LoanApproved"]

# 5. Extract 20 scenarios
# We avoid >90% confidence cases. Target range: 55% to 85% confidence.
# For Approve: y_prob between 0.55 and 0.85
# For Reject: y_prob between 0.15 and 0.45
normal_cases = []
trap_cases = []

# Filter candidates
normal_app = df[(df["LoanApproved"] == 1) & (df["y_pred"] == 1)]
normal_rej = df[(df["LoanApproved"] == 0) & (df["y_pred"] == 0)]
trap_app = df[(df["LoanApproved"] == 0) & (df["y_pred"] == 1)]  # AI approves, actual is Reject
trap_rej = df[(df["LoanApproved"] == 1) & (df["y_pred"] == 0)]  # AI rejects, actual is Approve

# Select normal approved (8 total, avoiding y_prob > 0.85)
high_app = normal_app[(normal_app["y_prob"] >= 0.70) & (normal_app["y_prob"] <= 0.85)].head(4)
mod_app = normal_app[(normal_app["y_prob"] >= 0.55) & (normal_app["y_prob"] < 0.70)].head(4)
normal_cases.extend(high_app.to_dict("records"))
normal_cases.extend(mod_app.to_dict("records"))

# Select normal rejected (8 total, avoiding y_prob < 0.15)
high_rej = normal_rej[(normal_rej["y_prob"] >= 0.15) & (normal_rej["y_prob"] <= 0.30)].head(4)
mod_rej = normal_rej[(normal_rej["y_prob"] > 0.30) & (normal_rej["y_prob"] <= 0.45)].head(4)
normal_cases.extend(high_rej.to_dict("records"))
normal_cases.extend(mod_rej.to_dict("records"))

# Ensure we have exactly 16 normal cases
if len(normal_cases) < 16:
    needed = 16 - len(normal_cases)
    extra = normal_app[(normal_app["y_prob"] >= 0.55) & (normal_app["y_prob"] <= 0.85)].head(needed)
    normal_cases.extend(extra.to_dict("records"))

# Select approved traps (AI says approve, actual is Reject)
# Sort to get the most obvious traps (highest defaults, highest DTI)
trap_app_sorted = trap_app.sort_values(
    by=["PreviousLoanDefaults", "TotalDebtToIncomeRatio"], ascending=[False, False]
)
# Restrict to y_prob <= 0.85
trap_app_filtered = trap_app_sorted[trap_app_sorted["y_prob"] <= 0.85]
high_trap_app = trap_app_filtered[trap_app_filtered["y_prob"] >= 0.70].head(1)
mod_trap_app = trap_app_filtered[(trap_app_filtered["y_prob"] >= 0.55) & (trap_app_filtered["y_prob"] < 0.70)].head(1)

if len(high_trap_app) == 0:
    high_trap_app = trap_app_filtered.head(1)
if len(mod_trap_app) == 0:
    mod_trap_app = trap_app_filtered.tail(1)

trap_cases.extend(high_trap_app.to_dict("records"))
trap_cases.extend(mod_trap_app.to_dict("records"))

# Select rejected traps (AI says reject, actual is Approve)
# Sort to get the most obvious traps (highest CreditScore, lowest defaults, lowest DTI)
trap_rej_sorted = trap_rej.sort_values(
    by=["CreditScore", "PreviousLoanDefaults", "TotalDebtToIncomeRatio"], ascending=[False, True, True]
)
# Restrict to y_prob >= 0.15
trap_rej_filtered = trap_rej_sorted[trap_rej_sorted["y_prob"] >= 0.15]
high_trap_rej = trap_rej_filtered[trap_rej_filtered["y_prob"] <= 0.30].head(1)
mod_trap_rej = trap_rej_filtered[(trap_rej_filtered["y_prob"] > 0.30) & (trap_rej_filtered["y_prob"] <= 0.45)].head(1)

if len(high_trap_rej) == 0:
    high_trap_rej = trap_rej_filtered.head(1)
if len(mod_trap_rej) == 0:
    mod_trap_rej = trap_rej_filtered.tail(1)

trap_cases.extend(high_trap_rej.to_dict("records"))
trap_cases.extend(mod_trap_rej.to_dict("records"))

print(f"Selected normal cases: {len(normal_cases)}")
print(f"Selected trap cases: {len(trap_cases)}")

# Combine into 20 scenarios and shuffle with a fixed seed to alternate decisions
import random
all_scenarios_list = []
for r in normal_cases:
    all_scenarios_list.append({"type": "normal", "data": r})
for r in trap_cases:
    all_scenarios_list.append({"type": "trap", "data": r})

rng = random.Random(42)
rng.shuffle(all_scenarios_list)

final_scenarios_records = all_scenarios_list

# 6. Initialize SHAP Explainer
explainer = shap.TreeExplainer(model)

feature_keys = [
    "Age",
    "MonthlyIncome",
    "LoanAmount",
    "CreditScore",
    "TotalDebtToIncomeRatio",
    "PreviousLoanDefaults",
    "BankruptcyHistory",
    "EmploymentStatus"
]

scenarios_json = []
for idx, item in enumerate(final_scenarios_records):
    record = item["data"]
    sc_type = item["type"]
    
    # Compute SHAP values for this specific row
    row_x = pd.DataFrame([{col: record[col] for col in X_cols}])
    shap_vals = explainer.shap_values(row_x)
    
    if isinstance(shap_vals, list):
        shap_for_class_1 = shap_vals[1][0]
    elif len(shap_vals.shape) == 3:
        shap_for_class_1 = shap_vals[0, :, 1]
    else:
        shap_for_class_1 = shap_vals[0]

    # Visual scaling: scale SHAP values so the maximum absolute impact is exactly 0.35 (35%)
    # This ensures high visibility on charts and rich descriptions!
    max_abs_shap = max(abs(v) for v in shap_for_class_1)
    if max_abs_shap > 0:
        scaled_shap = [(v / max_abs_shap) * 0.35 for v in shap_for_class_1]
    else:
        scaled_shap = [0.0] * len(shap_for_class_1)

    # Map features to display keys
    top_factors = []
    for f_idx, col in enumerate(X_cols):
        raw_feature = feature_keys[f_idx]
        impact = scaled_shap[f_idx]
        top_factors.append({
            "feature": raw_feature,
            "impact": float(impact),
            "direction": "positive" if impact >= 0 else "negative"
        })
        
    # Sort top factors by absolute impact
    top_factors = sorted(top_factors, key=lambda x: abs(x["impact"]), reverse=True)
    
    # Generate SHAP explanation text (top 2 positive and 2 negative factors)
    pos_factors = [f for f in top_factors if f["direction"] == "positive"]
    neg_factors = [f for f in top_factors if f["direction"] == "negative"]
    
    vn_labels = {
        "Age": "Tuổi",
        "MonthlyIncome": "Thu nhập",
        "LoanAmount": "Khoản vay",
        "CreditScore": "Điểm tín dụng",
        "TotalDebtToIncomeRatio": "Tỷ lệ DTI",
        "PreviousLoanDefaults": "Lịch sử nợ xấu",
        "BankruptcyHistory": "Lịch sử phá sản",
        "EmploymentStatus": "Việc làm"
    }
    
    # Map to final JSON format
    scenario_id = idx + 1
    ai_decision = "approve" if record["y_pred"] == 1 else "reject"
    conf_prob = record["y_prob"] if record["y_pred"] == 1 else 1.0 - record["y_prob"]
    confidence_percent = int(round(conf_prob * 100))
    
    gt_decision = "approve" if record["LoanApproved"] == 1 else "reject"

    # Construct a readable, concluding explanation paragraph
    decision_vn = "DUYỆT VAY" if ai_decision == "approve" else "TỪ CHỐI"
    
    pos_part = ""
    if pos_factors:
        p_names = [f"{vn_labels[f['feature']]} (+{abs(round(f['impact']*100))}%)" for f in pos_factors[:2]]
        pos_part = f"yếu tố tích cực như {', '.join(p_names)}"
        
    neg_part = ""
    if neg_factors:
        n_names = [f"{vn_labels[f['feature']]} (-{abs(round(f['impact']*100))}%)" for f in neg_factors[:2]]
        neg_part = f"điểm trừ từ {', '.join(n_names)}"

    if ai_decision == "approve":
        if pos_part and neg_part:
            shap_text = f"Mô hình nghiêng về đề xuất **{decision_vn}** chủ yếu nhờ các {pos_part}, lấn át hoàn toàn {neg_part}."
        elif pos_part:
            shap_text = f"Mô hình đề xuất **{decision_vn}** do ghi nhận nhiều {pos_part}."
        else:
            shap_text = f"Mô hình đề xuất **{decision_vn}** dựa trên các chỉ số an toàn ổn định của hồ sơ."
    else:
        if neg_part and pos_part:
            shap_text = f"Mô hình đề xuất **{decision_vn}** do chịu ảnh hưởng tiêu cực từ {neg_part}, vượt trội so với {pos_part}."
        elif neg_part:
            shap_text = f"Mô hình đề xuất **{decision_vn}** do ghi nhận nhiều {neg_part}."
        else:
            shap_text = f"Mô hình đề xuất **{decision_vn}** dựa trên mức độ rủi ro tín dụng chung của hồ sơ."
    
    # Generate 3 contextual QAs
    qa_list = []
    
    q1 = f"Tại sao AI lại đề xuất { 'Duyệt' if ai_decision == 'approve' else 'Từ chối' } hồ sơ này?"
    a1 = f"Mô hình AI nhận thấy { shap_text.lower() } Điều này tạo nên mức độ tin cậy { confidence_percent }%."
    qa_list.append({"question": q1, "answer": a1})
    
    q2 = "Có điểm rủi ro hoặc thuận lợi nào cần lưu ý trong hồ sơ thực tế?"
    risk_points = []
    if record["PreviousLoanDefaults"] > 0:
        risk_points.append(f"khách hàng có {record['PreviousLoanDefaults']} lần nợ quá hạn nợ xấu trước đây (Cảnh báo đỏ)")
    if record["TotalDebtToIncomeRatio"] > 0.40:
        risk_points.append(f"tỷ lệ nợ trên thu nhập DTI ở mức cao ({round(record['TotalDebtToIncomeRatio']*100)}%)")
    if record["CreditScore"] < 600:
        risk_points.append(f"điểm tín dụng FICO ở mức trung bình yếu ({record['CreditScore']} điểm)")
        
    if risk_points:
        a2 = f"Hồ sơ thực tế có các điểm rủi ro đáng chú ý: {', '.join(risk_points)}. Bạn cần đối chiếu kỹ lưỡng trước khi phê duyệt."
    else:
        a2 = f"Hồ sơ tương đối sạch và an toàn: không có nợ xấu, tỷ lệ DTI an toàn ({round(record['TotalDebtToIncomeRatio']*100)}%), và điểm tín dụng tốt ({record['CreditScore']} điểm)."
    qa_list.append({"question": q2, "answer": a2})
    
    q3 = "Độ tin cậy của giải thích này như thế nào?"
    if sc_type == "trap":
        if ai_decision == "approve":
            a3 = "Cảnh báo: Mô hình AI đang bị thiên lệch bởi yếu tố thu nhập cao và bỏ qua lịch sử nợ xấu nghiêm trọng. Quyết duyệt này là SAI LẦM thực tế, bạn nên bác bỏ quyết định của AI."
        else:
            a3 = "Cảnh báo: Khách hàng có các chỉ số tài chính rất tốt và đủ điều kiện duyệt vay, nhưng AI vẫn từ chối nhầm do các thiên lệch ngẫu nhiên của mô hình. Bạn nên bác bỏ quyết định của AI."
    else:
        a3 = "Mô hình toán học của AI hoạt động chính xác và nhất quán với quy tắc tín dụng ngân hàng thông thường đối với hồ sơ này."
    qa_list.append({"question": q3, "answer": a3})

    scenarios_json.append({
        "scenario_id": scenario_id,
        "scenario_type": sc_type,
        "profile": {
            "Age": int(record["Age"]),
            "MonthlyIncome": int(round(record["MonthlyIncome_VND"])),
            "LoanAmount": int(round(record["LoanAmount_VND"])),
            "CreditScore": int(record["CreditScore"]),
            "TotalDebtToIncomeRatio": float(record["TotalDebtToIncomeRatio"]),
            "PreviousLoanDefaults": int(record["PreviousLoanDefaults"]),
            "BankruptcyHistory": int(record["BankruptcyHistory"]),
            "EmploymentStatus": record["EmploymentStatus"]
        },
        "ai_prediction": {
            "decision": ai_decision,
            "confidence_percent": confidence_percent
        },
        "ground_truth": {
            "decision": gt_decision,
            "note": "AI đoán sai do bỏ qua điều kiện nợ xấu hoặc DTI vượt ngưỡng." if sc_type == "trap" else ""
        },
        "shap_summary": {
            "text": shap_text,
            "top_factors": top_factors[:4]
        },
        "interactive_qa": qa_list
    })

# 7. Write to src/data/scenarios.json
out_path = r"d:\My_projects\XAI_KLTN\src\data\scenarios.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({"scenarios": scenarios_json}, f, ensure_ascii=False, indent=2)

print(f"Scenarios successfully written to: {out_path}")
