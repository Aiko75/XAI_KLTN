import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_curve, auc, confusion_matrix

# Load
df = pd.read_csv(r"d:\My_projects\XAI_KLTN\data\2nd test\Financial Risk for Loan Approval.csv")

# Scale
inc_min = df["MonthlyIncome"].min()
inc_max = df["MonthlyIncome"].max()
df["MonthlyIncome_VND"] = 10000000 + (df["MonthlyIncome"] - inc_min) / (inc_max - inc_min) * 80000000

loan_min = df["LoanAmount"].min()
loan_max = df["LoanAmount"].max()
df["LoanAmount_VND"] = 50000000 + (df["LoanAmount"] - loan_min) / (loan_max - loan_min) * 850000000

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

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
model.fit(X_train, y_train)

# Create output dirs
os.makedirs(r"d:\My_projects\XAI_KLTN\docs\assets", exist_ok=True)
os.makedirs(r"d:\My_projects\XAI_KLTN\public", exist_ok=True)

# 1. ROC Curve (Both VI and EN are identical in English labels)
def save_roc_curve():
    plt.figure(figsize=(6, 5))
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
    roc_auc = auc(fpr, tpr)

    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) - Test Set')
    plt.legend(loc="lower right")
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\roc_curve.png", dpi=150)
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\roc_curve.png", dpi=150)
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\roc_curve_en.png", dpi=150)
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\roc_curve_en.png", dpi=150)
    plt.close()

save_roc_curve()

# 2. Feature Importance
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

importances = model.feature_importances_
indices = np.argsort(importances)[::-1]

# Save VI
def save_fi_vi():
    features_sorted = [vn_labels[X_cols[i]] for i in indices]
    importances_sorted = importances[indices]
    plt.figure(figsize=(6, 5))
    sns.barplot(x=importances_sorted, y=features_sorted, hue=features_sorted, palette="viridis", legend=False)
    plt.xlabel('Mức độ quan trọng (Importance)')
    plt.ylabel('Các thuộc tính hồ sơ')
    plt.title('Độ Quan Trọng Thuộc Tính - Random Forest')
    plt.grid(True, axis='x', linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\feature_importance.png", dpi=150)
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\feature_importance.png", dpi=150)
    plt.close()

# Save EN
def save_fi_en():
    features_sorted = [en_labels[X_cols[i]] for i in indices]
    importances_sorted = importances[indices]
    plt.figure(figsize=(6, 5))
    sns.barplot(x=importances_sorted, y=features_sorted, hue=features_sorted, palette="viridis", legend=False)
    plt.xlabel('Importance')
    plt.ylabel('Profile Features')
    plt.title('Random Forest Feature Importance')
    plt.grid(True, axis='x', linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\feature_importance_en.png", dpi=150)
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\feature_importance_en.png", dpi=150)
    plt.close()

save_fi_vi()
save_fi_en()

# 3. Confusion Matrix
y_pred = model.predict(X_test)
cm = confusion_matrix(y_test, y_pred)

# Save VI
def save_cm_vi():
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Từ chối', 'Duyệt'], yticklabels=['Từ chối', 'Duyệt'])
    plt.ylabel('Thực tế (Actual)')
    plt.xlabel('Dự đoán (Predicted)')
    plt.title('Ma Trận Nhầm Lẫn - Tập Kiểm Thử')
    plt.tight_layout()
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\confusion_matrix.png", dpi=150)
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\confusion_matrix.png", dpi=150)
    plt.close()

# Save EN
def save_cm_en():
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Reject', 'Approve'], yticklabels=['Reject', 'Approve'])
    plt.ylabel('Actual')
    plt.xlabel('Predicted')
    plt.title('Confusion Matrix - Test Set')
    plt.tight_layout()
    plt.savefig(r"d:\My_projects\XAI_KLTN\docs\assets\confusion_matrix_en.png", dpi=150)
    plt.savefig(r"d:\My_projects\XAI_KLTN\public\confusion_matrix_en.png", dpi=150)
    plt.close()

save_cm_vi()
save_cm_en()

print("All plots (VI + EN) generated successfully!")
