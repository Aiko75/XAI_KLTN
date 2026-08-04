import os
import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# 1. Load and prepare dataset
csv_path = r"d:\My_projects\XAI_KLTN\data\2nd test\Financial Risk for Loan Approval.csv"
if not os.path.exists(csv_path):
    raise FileNotFoundError(f"Dataset not found at: {csv_path}")

df = pd.read_csv(csv_path)

# Scale continuous variables to VND
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

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# Train the Random Forest
print("Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
model.fit(X_train, y_train)

# Serialize decision trees
def serialize_node(tree, node_idx):
    if tree.children_left[node_idx] == -1: # Leaf
        # Get count of class samples at leaf
        class_counts = tree.value[node_idx][0]
        total = sum(class_counts)
        prob_approve = class_counts[1] / total if total > 0 else 0.0
        return {
            "is_leaf": True,
            "value": float(prob_approve)
        }
    else:
        return {
            "is_leaf": False,
            "feature": int(tree.feature[node_idx]),
            "threshold": float(tree.threshold[node_idx]),
            "left": serialize_node(tree, tree.children_left[node_idx]),
            "right": serialize_node(tree, tree.children_right[node_idx])
        }

serialized_trees = []
for i, estimator in enumerate(model.estimators_):
    serialized_trees.append(serialize_node(estimator.tree_, 0))

output_data = {
    "feature_names": X_cols,
    "estimators": serialized_trees
}

out_path = r"d:\My_projects\XAI_KLTN\src\data\rf_model.json"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"Model exported successfully to: {out_path}")
