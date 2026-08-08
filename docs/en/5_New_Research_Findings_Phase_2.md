# Document 5: New Empirical Findings in HCI & Algorithmic Behaviors (Phase 2.0)

This report details the technical findings and human-computer interaction (HCI) observations discovered during the Phase 2.0 upgrades, including pilot testing of the Multi-Model Benchmarking, User Segmentation, and Interactive Counterfactual (What-If) Simulator.

---

## 1. Finding 1: Non-Monotonic AI Decision Boundaries in What-If Simulations
When interacting with the What-If Simulator to modify client features in real-time, the research team identified a counter-intuitive behavior in the AI's predictions:

*   **Phenomenon**: As FICO Credit Score is gradually increased from 600 to 850 (holding all other parameters constant), the AI prediction flips non-monotonically: **APPROVE (at 600) $\rightarrow$ REJECT (at 680) $\rightarrow$ APPROVE (at 750)**.
*   **Technical Explanation**:
    *   Tree-based ensembles (such as Random Forest and XGBoost) partition the multi-dimensional feature space into axis-aligned hyper-rectangles using binary decision boundaries.
    *   The model does not intrinsically understand human logic (e.g., that higher credit scores or higher incomes should monotonically decrease credit risk).
    *   At a score of 680, the client falls into a specific partition combined with other factors (such as a high loan amount > 450M VND) that had high default rates in the Kaggle training dataset, leading to a "Reject" decision. Meanwhile, at a score of 600, the client falls into a different tree branch that has more lenient default thresholds.
*   **Thesis & Academic Implications**:
    *   **Value of the What-If Simulator**: This phenomenon demonstrates the vital role of interactive XAI. Without a live What-If simulator, underwriters are susceptible to **Automation Bias**, blindly trusting the static recommendation without exposing the model's logical blindspots.
    *   **Monotonic Constraints**: The thesis proposes incorporating monotonic constraints (forcing the algorithm to enforce positive derivatives on indicators like Income and Credit Score) during training. This ensures the AI conforms to the strict model risk management standards of commercial banking.

---

## 2. Finding 2: Tech-Savviness, Skepticism, Age Generational Variance, and Mobile Controls
Integrating user demographic segmentation (Major, AI Usage Frequency, Age Group) and automatic Device Type identification on onboarding has revealed early behavioral trends:

*   **Tech-Savviness vs. Algorithm Skepticism**:
    *   **Computer Science / IT** majors interacted significantly more with the What-If panel and Gemini chatbot (generating 40% more hover and click events than average). They actively tested extreme feature combinations to stress-test the model.
    *   IT majors recorded a lower agreement rate with the AI, indicating that their technical understanding of ML black-boxes helps mitigate automation bias.
*   **AI Exposure and Information Processing Speed**:
    *   Users who interact with AI tools **Daily / Frequently** processed SHAP bar charts and force plots faster. Their average decision time in Group C was 15% shorter than participants with rare AI exposure, showing the emergence of "AI Interaction Fluency."
*   **Generational Variance (Age Group) & Decision Behaviors**:
    *   Younger brackets **18-22 (Students)** and **23-30 (Young professionals)** readily trusted visual SHAP Force Plots and willingly experimented with the counterfactual sliders to understand the model logic. Conversely, mid-career/older brackets **> 45** focused more on reading the raw application profile text and made cautious decisions, showing resilience against AI recommendations.
*   **Mobile Device Noise Controls**:
    *   Automatically identifying mobile/tablet clients and rendering warning alerts helps maintain control over sample collection quality (encouraging computer use). For touchscreen submissions, recording touch durations and coordinates serves as the equivalent metric for desktop mouse hover hesitation.

---

## 3. Finding 3: Split-Attention Effect & Cognitive Overload
Adding the What-If widget alongside SHAP Force Plots, Bar Charts, and Chatbots in the Group C dashboard yielded a major HCI insight:

*   **Phenomenon**: The attention check pass rate in Group C dropped to **50%** during pilot testing (compared to 70% in the Group A control group).
*   **HCI Analysis**:
    *   This is a classic manifestation of the **Split-Attention Effect** in Cognitive Load Theory.
    *   When an interface packs multiple advanced explanation features, the user's attention is fragmented across the dashboard. Underwriters must cross-reference original profiles, SHAP values, chatbot dialogs, and simulated sliders.
    *   This mental depletion causes cognitive fatigue, making users miss adversarial cases or intentional trap profiles.
*   **Proposed XAI Design Philosophy**:
    The thesis concludes that XAI design must follow the **"Less is More"** paradigm. Rather than overloading the interface, explanations should employ **progressive disclosure**—only revealing advanced tools like What-If panels or chatbots upon user demand or when the AI indicates low decision confidence.

---

## 4. Finding 4: Experimental Interface Design Limitations & Sample Size Threshold Adjustments

### Limitation 1: Cognitive Ambiguity in User Task Workflow (Interface Ambiguity)
*   **Issue**: During pilot testing, the research team identified a certain level of cognitive ambiguity in the experimental interface. Participants did not immediately understand their optimal workflow: which panel to focus on first, what parameters to analyze, and how to weigh the metrics before making a decision.
*   **Ideal Design**: The requested loan details (Loan Amount) and the customer's financial capacity profile (Income, Credit Score, DTI) should be split into two visually distinct sections. The interface should have stated explicit instructions: *"Assess the feasibility of the loan size compared to the financial capacity first, then cross-reference with the customer's risk factors to approve or reject."*
*   **Thesis Implications**: Since the current experiment is already distributed and collecting active data, changing the UI code is avoided to prevent sample discrepancy. This factor is documented as an **Experimental UI Limitation** and will be analyzed in the discussion chapter regarding its impact on decision times and frustration levels on NASA-TLX.

### Limitation 2: Minimal Sample Size Threshold Adjustment
*   **Issue**: The initial target was to collect 60-100 real subjects. However, because the test requires evaluating 20 detailed scenarios requiring 15-20 minutes of high concentration, reaching this sample size within the graduation deadline presents a practical bottleneck.
*   **Adjustment**: To ensure timely submission and maintain data collection quality, **the minimal target sample size (floor) is adjusted to 40 participants**.
*   **Statistical Validity**: A sample size of $N = 40$ (roughly 13-15 users per Group A, B, C) meets the minimal requirement for running non-parametric statistical tests (such as Wilcoxon signed-rank or Kruskal-Wallis tests) to extract statistically significant behavioral variances in HCI.

### Limitation 3: Age Demographic Homogeneity
*   **Issue**: The empirical data indicates that over 90% of the participants belong to the **18-22 age group (student age)**, due to the survey being primarily distributed within university networks. This creates a high level of demographic homogeneity.
*   **Thesis Implications**: This is documented as a clear **Demographic Limitation** in the Discussion chapter. Students may exhibit higher technology readiness and visual processing fluency with SHAP graphs compared to older cohorts (> 45 years), who might express algorithmic trust or skepticism differently. Thus, findings are representative of a tech-literate, younger demographic, and caution should be exercised when generalizing findings to the broader banking workforce.
