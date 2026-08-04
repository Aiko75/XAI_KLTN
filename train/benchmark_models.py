import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import shap

# Set style
sns.set_theme(style="whitegrid")

# 1. Load and prepare dataset
csv_path = r"d:\My_projects\XAI_KLTN\data\2nd test\Financial Risk for Loan Approval.csv"
if not os.path.exists(csv_path):
    raise FileNotFoundError(f"Dataset not found at: {csv_path}")

df = pd.read_csv(csv_path)

# Scale continuous variables
inc_min = df["MonthlyIncome"].min()
inc_max = df["MonthlyIncome"].max()
df["MonthlyIncome_VND"] = 10000000 + (df["MonthlyIncome"] - inc_min) / (inc_max - inc_min) * 80000000

loan_min = df["LoanAmount"].min()
loan_max = df["LoanAmount"].max()
df["LoanAmount_VND"] = 50000000 + (df["LoanAmount"] - loan_min) / (loan_max - loan_min) * 850000000

# Encode EmploymentStatus
employment_mapping = {"Unemployed": 0, "Employed": 1, "Self-Employed": 2}
df["EmploymentStatus_encoded"] = df["EmploymentStatus"].map(employment_mapping)

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

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 2. Train Models
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
    "Decision Tree": DecisionTreeClassifier(max_depth=6, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42),
    "XGBoost": XGBClassifier(n_estimators=100, max_depth=6, random_seed=42, random_state=42, eval_metric='logloss')
}

metrics = []

for name, model in models.items():
    print(f"Training {name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    metrics.append({
        "Model": name,
        "Accuracy": acc,
        "Precision": prec,
        "Recall": rec,
        "F1-Score": f1
    })

df_metrics = pd.DataFrame(metrics)
print("\n=== Model Evaluation Summary ===")
print(df_metrics.to_markdown(index=False))

# Make folders
os.makedirs(r"d:\My_projects\XAI_KLTN\docs\assets", exist_ok=True)
os.makedirs(r"d:\My_projects\XAI_KLTN\public", exist_ok=True)

# Save metrics CSV for docs reference
df_metrics.to_csv(r"d:\My_projects\XAI_KLTN\docs\assets\metrics_comparison.csv", index=False)

# 3. Plot Model Comparison
def plot_comparison(lang="vi"):
    plt.figure(figsize=(9, 5))
    df_melted = df_metrics.melt(id_vars="Model", var_name="Metric", value_name="Value")
    
    if lang == "vi":
        metric_labels = {"Accuracy": "Độ chính xác (Accuracy)", "Precision": "Độ chuẩn xác (Precision)", "Recall": "Độ nhạy (Recall)", "F1-Score": "Chỉ số F1-Score"}
        df_melted["Metric"] = df_melted["Metric"].map(metric_labels)
        title = "So sánh hiệu năng giữa các Mô hình Machine Learning"
        xlabel = "Mô hình"
        ylabel = "Giá trị (%)"
    else:
        title = "Performance Benchmarking Across Machine Learning Models"
        xlabel = "Model"
        ylabel = "Value (%)"
        
    ax = sns.barplot(data=df_melted, x="Model", y="Value", hue="Metric", palette="muted")
    plt.title(title, fontsize=14, fontweight="bold", pad=15)
    plt.xlabel(xlabel, fontsize=12, labelpad=10)
    plt.ylabel(ylabel, fontsize=12, labelpad=10)
    plt.ylim(0.5, 1.05)
    plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left', borderaxespad=0)
    plt.grid(True, axis="y", linestyle=":", alpha=0.6)
    plt.tight_layout()
    
    suffix = "" if lang == "vi" else "_en"
    plt.savefig(fr"d:\My_projects\XAI_KLTN\docs\assets\model_comparison{suffix}.png", dpi=150)
    plt.savefig(fr"d:\My_projects\XAI_KLTN\public\model_comparison{suffix}.png", dpi=150)
    plt.close()

plot_comparison("vi")
plot_comparison("en")

# 4. Plot SHAP Comparison (Simple DT vs Complex XGBoost)
print("\nComputing SHAP values for Decision Tree vs XGBoost...")
explainer_dt = shap.TreeExplainer(models["Decision Tree"])
shap_values_dt = explainer_dt.shap_values(X_test)
# In shap >= 0.40, TreeExplainer outputs binary outputs as a list of arrays [class_0, class_1] for DecisionTree
if isinstance(shap_values_dt, list):
    # Take positive class predictions (index 1)
    shap_values_dt_class1 = shap_values_dt[1]
else:
    # DT in some older shap version might return 3D or 2D array directly
    if len(shap_values_dt.shape) == 3:
        shap_values_dt_class1 = shap_values_dt[:, :, 1]
    else:
        shap_values_dt_class1 = shap_values_dt

explainer_xgb = shap.TreeExplainer(models["XGBoost"])
shap_values_xgb = explainer_xgb.shap_values(X_test)

# Map features to nice titles for plotting
vn_labels = {
    "Age": "Tuổi",
    "MonthlyIncome_VND": "Thu nhập",
    "LoanAmount_VND": "Khoản vay",
    "CreditScore": "Điểm tín dụng",
    "TotalDebtToIncomeRatio": "Tỷ lệ DTI",
    "PreviousLoanDefaults": "Lịch sử nợ xấu",
    "BankruptcyHistory": "Lịch sử phá sản",
    "EmploymentStatus_encoded": "Việc làm"
}
en_labels = {
    "Age": "Age",
    "MonthlyIncome_VND": "Monthly Income",
    "LoanAmount_VND": "Loan Amount",
    "CreditScore": "Credit Score",
    "TotalDebtToIncomeRatio": "DTI Ratio",
    "PreviousLoanDefaults": "Previous Defaults",
    "BankruptcyHistory": "Bankruptcy History",
    "EmploymentStatus_encoded": "Employment Status"
}

def plot_shap_comparison(lang="vi"):
    fig, axes = plt.subplots(1, 2, figsize=(16, 7))
    labels = vn_labels if lang == "vi" else en_labels
    
    # Pre-map features
    X_test_mapped = X_test.rename(columns=labels)
    
    # Decision Tree summary plot (on axes[0])
    plt.axes(axes[0])
    shap.summary_plot(
        shap_values_dt_class1, 
        X_test_mapped, 
        plot_type="bar", 
        show=False,
        max_display=8
    )
    title_dt = "Quyền số SHAP - Decision Tree (Mô hình đơn giản)" if lang == "vi" else "SHAP Importance - Decision Tree (Simple Model)"
    axes[0].set_title(title_dt, fontsize=12, fontweight="bold", pad=10)
    
    # XGBoost summary plot (on axes[1])
    plt.axes(axes[1])
    shap.summary_plot(
        shap_values_xgb, 
        X_test_mapped, 
        plot_type="bar", 
        show=False,
        max_display=8
    )
    title_xgb = "Quyền số SHAP - XGBoost (Mô hình phức tạp)" if lang == "vi" else "SHAP Importance - XGBoost (Complex Model)"
    axes[1].set_title(title_xgb, fontsize=12, fontweight="bold", pad=10)
    
    plt.suptitle(
        "Giải thích Đặc trưng (SHAP): Cây Quyết Định Đơn Lẻ vs. XGBoost Ensemble" if lang == "vi" else
        "Feature Attribution (SHAP): Single Decision Tree vs. XGBoost Ensemble",
        fontsize=15, fontweight="bold", y=1.02
    )
    plt.tight_layout()
    
    suffix = "" if lang == "vi" else "_en"
    plt.savefig(fr"d:\My_projects\XAI_KLTN\docs\assets\shap_comparison{suffix}.png", dpi=150, bbox_inches='tight')
    plt.savefig(fr"d:\My_projects\XAI_KLTN\public\shap_comparison{suffix}.png", dpi=150, bbox_inches='tight')
    plt.close()

plot_shap_comparison("vi")
plot_shap_comparison("en")

print("Model benchmarking plots generated successfully!")
