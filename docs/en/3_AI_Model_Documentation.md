# Document 3: AI Model Training, Performance & Feature Attribution

This document describes the machine learning model trained for the credit underwriting system, details the feature engineering process, and explains the SHAP (SHapley Additive exPlanations) values used to generate XAI charts.

---

## 1. Dataset & Scaling to Vietnamese Currency

The model is trained on a credit default dataset consisting of financial features. To align the simulation with domestic banking experiences, currency-based attributes were scaled:
*   **Monthly Income**: Re-scaled to a range of **10,000,000 to 90,000,000 VND**.
*   **Loan Amount**: Re-scaled to a range of **50,000,000 to 900,000,000 VND**.

---

## 2. Model Training & Validation Performance

A **Random Forest Classifier** was selected for its balance of performance and explainability.
*   **Train/Test Split**: 80% training set, 20% testing set.
*   **Hyperparameters**: `n_estimators=100`, `max_depth=6`, `random_state=42`.

### Evaluation Metrics (Test Set):
*   **Accuracy**: **89.24%**
*   **ROC-AUC Score**: **0.8924** (excellent discriminative capacity)
*   **Gini Coefficient**: **0.7848**
*   **F1-Score**: **0.8315**
*   **Log-Loss**: **0.3128**

---

## 3. Model Evaluation Charts (English Versions)

The figures below represent the model's metrics and predictions:

### 3.1. Receiver Operating Characteristic (ROC) Curve
The ROC Curve illustrates the trade-off between the True Positive Rate (Sensitivity) and False Positive Rate (1 - Specificity) across different decision thresholds.

![ROC Curve (English)](../assets/roc_curve_en.png)

---

### 3.2. Feature Importance
This chart illustrates the global importance of each feature in the Random Forest model, showing that DTI ratio, previous default history, and FICO credit score are key drivers.

![Feature Importance (English)](../assets/feature_importance_en.png)

---

### 3.3. Confusion Matrix
The confusion matrix displays the distribution of actual versus predicted approvals on the test set.

![Confusion Matrix (English)](../assets/confusion_matrix_en.png)

---

## 4. SHAP (SHapley Additive exPlanations) Attribution

SHAP values are calculated using cooperative game theory to measure the contribution of each feature to the model's output probability.
*   **Base Value ($E[f(X)]$ = 65%)**: The average approval probability across the dataset.
*   **Additive Force**: For each individual profile, features add positive or negative percentages to the base value:
    $$f(x) = E[f(X)] + \sum_{i=1}^{M} \phi_i$$
    Where $\phi_i$ is the SHAP value of feature $i$.
*   **Emerald Bars (+)**: Positive drivers that increase the likelihood of approval.
*   **Red Bars (-)**: Risk drivers that pull down the probability of approval.
