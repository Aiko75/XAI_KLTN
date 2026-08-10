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

### Limitation 4: Response-Mapping Ambiguity & Sensitivity Analysis
*   **Response-Mapping Ambiguity**: The decision-making buttons are labeled *"Agree with AI recommendation"* / *"Reject AI recommendation"* instead of direct loan actions (*"Approve Loan"* / *"Reject Loan"*). Some participants may misunderstand the buttons as direct underwriting choices rather than relative responses to the AI, introducing potential cognitive inversion across an undetermined subset of responses.
*   **Sensitivity Analysis**: 
    *   Because the button design is strictly uniform across all three treatment groups (A, B, and C), this risk functions as a **non-differential measurement error**.
    *   According to statistical measurement theory, non-differential error does not invert the direction of the hypothesized effects; rather, it introduces random noise that attenuates the observed effect size toward the null (**attenuation bias**).
    *   Consequently, even assuming a baseline $X\%$ random cognitive inversion rate, the core directional hypothesis (that XAI mitigates Automation Bias) remains theoretically sound.
*   **Proactive Quantitative Comprehension Check**:
    *   To convert an uncontrolled qualitative limitation into a **quantifiable limitation with empirical data**, a **Button Comprehension Check** question was injected immediately following the 20 scenarios (before the NASA-TLX survey) for upcoming participants.
    *   This provides an empirical measure of the actual misunderstanding rate ($X\%$) within the sample for rigorous defense before the thesis committee.


---

## 5. Finding 5: 5-Tier Data Filtering Algorithm and Group C Oversampling Strategy

### 5.1. The 5-Tier Data Filtering Algorithm
To eliminate cognitive collapse (Collapse Point) and low-effort satisficing, data is filtered through 5 strict tiers:
1.  **Tier 1 (Per-Group Minimum Time Threshold)**: Establishes visual reading thresholds based on interface complexity: Group A >= 2.0s, Group B >= 3.0s, Group C >= 4.0s.
2.  **Tier 2 (Collapse Point Detection)**: Scans from Scenario 3 onwards. The Collapse Point is defined as the first occurrence of **>= 3 consecutive scenarios** with decision times below the group threshold.
3.  **Tier 3 (Continuous Truncation)**: Truncates all responses from the Collapse Point to Scenario 20. Isolated later spikes are discarded to maintain behavioral state consistency.
4.  **Tier 4 (Minimum Valid Scenarios Check)**: If the remaining valid scenarios before the collapse point **< 10/20**, the participant is completely excluded.
5.  **Tier 5 (Straight-lining Check on Valid Data)**: Applies a straight-lining check (>= 80% identical choices) on the remaining valid scenarios.

### 5.2. Group C Oversampling Strategy
The 5-Tier filter revealed that Group C suffers the highest cognitive collapse rate (only ~54.5% data retention vs >90% for Group A). Equal random assignment would cause severe sample size imbalance for Group C.

**Backend Implementation**: The system API (`api/users/start`) was upgraded with **Oversampling Weighting** ($A = 1.0, B = 1.35, C = 1.85$). New participants are automatically routed to Group C more frequently until clean completed counts across all 3 groups balance out (~15-20 clean completes per group).

---

## 6. Finding 6: Participant Dropout Deep-Dive Analysis

Participant dropout data is analyzed to provide secondary qualitative insights for the Discussion chapter:

*   **Dropout Rate by Interface**: Group C exhibits significantly higher dropout rates than Groups A and B. This provides empirical evidence that information-overloaded XAI interfaces cause **Complete Task Abandonment**.
*   **Dropout Stages**: 
    *   **Early Dropout (Scenarios 1-5)**: Represents **Information Shock** caused by overwhelming visual complexity upon initial contact.
    *   **Middle/Late Dropout (Scenarios 6-19)**: Represents **Cognitive Fatigue Accumulation** over extended evaluation.
*   **Device Impact**: Mobile users exhibit higher dropout rates due to screen size constraints when interacting with Force Plots.


