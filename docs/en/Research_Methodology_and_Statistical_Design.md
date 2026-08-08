# RESEARCH METHODOLOGY & STATISTICAL ANALYSIS DESIGN FOR PHASE 2

> [!NOTE]
> This document establishes the theoretical framework, experimental variables, research hypotheses, and advanced statistical analysis methods (specifically GEE and GLMM for clustered/repeated measures data) to support the **Research Methodology** chapter of the graduation thesis.

---

## 1. Experimental Variable Framework

The human-computer interaction (HCI) experiment is structured as a **mixed-design factorial experiment**, combining a **Between-Subjects Design** for interface exposure and a **Within-Subjects Design (Repeated Measures)** across 20 distinct credit underwriting scenarios.

### 1.1. Independent Variables (IVs)
1.  **XAI Interface Type** - *Between-Subjects IV*: Consists of 3 levels:
    *   **Group A (Control)**: Black-box AI (Only recommendation and confidence level).
    *   **Group B (Treatment 1)**: Static XAI (SHAP Bar Chart + natural language explanation summary).
    *   **Group C (Treatment 2)**: Interactive XAI (SHAP Force Plot + What-if analysis + Pearson Correlation Matrix + Interactive Gemini Bilingual Chatbot).
2.  **AI Recommendation Accuracy** - *Within-Subjects IV*: Consists of 2 levels:
    *   **Normal Cases (14 scenarios)**: AI prediction is accurate and business-aligned.
    *   **Trap/Adversarial Cases (6 scenarios)**: AI prediction is intentionally flawed (e.g., recommending approval for high-risk default profiles).

### 1.2. Dependent Variables (DVs)
1.  **User Decision Correctness (Trust Calibration)** - *Binary DV*:
    *   `1`: Correct decision based on actual credit risk (e.g., rejecting a bad credit file despite AI recommending approval).
    *   `0`: Incorrect decision (e.g., blindly agreeing with an incorrect AI prediction or rejecting a correct AI recommendation).
2.  **Decision Time / Response Time** - *Continuous DV*: Measured in seconds (s).
3.  **NASA-TLX Cognitive Workload** - *Ordinal DV*: Score ranging from 1 to 20 across 6 cognitive dimensions (Mental Demand, Temporal Demand, Performance, Effort, Frustration, and Physical Demand).

### 1.3. Control Variables & Covariates (CVs)
1.  **Occupation Group / Domain**: Grouped into two main blocks (STEM/Technical vs. Business/Social/Others).
2.  **Device Type**: Desktop vs. Mobile (Pilot testing revealed 100% of dropouts occurred on Mobile).
3.  **AI Exposure Frequency**: Rarely, Occasionally, Frequently, Daily.
4.  **Scenario Order**: 1 to 20 (Randomized per user to control for learning or fatigue effects).

---

## 2. Research Hypotheses and Theoretical Foundations

Hypotheses are formulated based on the single-subject pilot run observations and two foundation theories: **Automation Bias** and **Trust Calibration**.

### Hypothesis H1: XAI Improves Trust Calibration and Mitigates Automation Bias
*   **Statement**: Participants in Group B (Static XAI) and Group C (Interactive XAI) will achieve a significantly higher decision correctness rate on **Trap Scenarios** compared to Group A (Black-box). Concurrently, Groups B and C will display superior trust calibration (agreeing when the AI is correct, rejecting when the AI is incorrect).
*   **Theoretical Foundations**:
    *   *Automation Bias (Parasuraman & Manzey, 2010)*: In the absence of explanations, humans tend to act as "cognitive misers," defaulting to passive compliance with automated recommendations.
    *   *Trust Calibration (Muir, 1987)*: SHAP graphs and chat explanations expose the underlying feature weights of the AI model, allowing underwriters to spot logical flaws in trap profiles and activate analytical skepticism.
*   **Initial Exploratory Grounding**: Single-subject pilot testing in Group A resulted in 91.7% compliance with incorrect AI decisions on trap scenarios, reflecting a clear lack of calibrated trust in the black-box interface.

### Hypothesis H2: XAI Increases Decision Time by Activating Analytical Processing
*   **Statement**: The average decision time for Groups B and C will be longer than Group A. Additionally, an interaction effect (IV1 * IV2) is expected: when encountering trap scenarios (incorrect AI), decision time for Groups B and C will extend significantly compared to normal scenarios, whereas Group A will show no significant difference in decision time between trap and normal scenarios.
*   **Theoretical Foundations**:
    *   *Dual-Process Theory (Kahneman, 2011)*: XAI acts as an intervention that disrupts intuitive, fast decisions (System 1 - immediate compliance) and forces slow, analytical scrutiny (System 2 - verifying data points and weight values), thereby increasing response latency.
*   **Initial Exploratory Grounding**: Pilot runs recorded a marked increase in decision times for individuals equipped with XAI dashboards compared to the control group.

### Hypothesis H3: Interactive XAI Increases Extraneous Cognitive Load but Redefines Frustration Thresholds
*   **Statement**: Group C (Interactive XAI) will report higher NASA-TLX scores for Mental and Temporal Demand compared to Groups B and A. However, Group C will report higher self-assessed Performance and lower Frustration due to contextual assistance from the bilingual chatbot.
*   **Theoretical Foundations**:
    *   *Cognitive Load Theory (Sweller, 1988)*: The concurrent display of multiple interactive XAI modules (Force plot, correlation matrix, chatbot, what-if sliders) creates a **Split-Attention Effect**, increasing extraneous cognitive load. However, conversational chatbot dialogs customize explanation delivery, reducing cognitive ambiguity and frustration.

---

## 3. Statistical Analysis Methods for Repeated Measures

### 3.1. Nature of Clustered and Repeated Measures Data
Since each participant evaluates **20 consecutive credit profiles**, the 20 response entries are clustered by subject. These repeated observations violate the assumption of **Independence of Observations** required for standard OLS or Logistic regression models. Using standard models would result in underestimated Standard Errors and inflated Type I error rates ($p$-values).

To model within-subject correlations, two advanced statistical frameworks are implemented:

### 3.2. Generalized Estimating Equations (GEE)
GEE is a highly rigorous method designed specifically for clustered/repeated measures. It controls for within-subject correlation by specifying a **Working Correlation Matrix**.

*   **Correlation Structure**: An **Autoregressive of order 1 (AR(1))** or **Exchangeable** structure is selected, modeling the assumption that evaluations closer in sequence exhibit higher correlation.
*   **GEE Model Specification for User Decision Correctness (Binary DV - Link: Logit)**:
    $$\text{logit}(P(Y_{ij} = 1)) = \beta_0 + \beta_1 (\text{XAI\_Group}_i) + \beta_2 (\text{AI\_Accuracy}_{ij}) + \beta_3 (\text{XAI\_Group}_i \times \text{AI\_Accuracy}_{ij}) + \beta_4 (\text{Device}_i) + \beta_5 (\text{Scenario\_Order}_{ij})$$
    Where:
    *   $Y_{ij}$ is the correctness code (1/0) of user $i$ on scenario $j$.
    *   $\beta_3$ is the interaction coefficient verifying if XAI significantly boosts correctness specifically on trap scenarios.
*   **GEE Model Specification for Decision Time (Continuous DV - Link: Identity)**:
    Fitted using a linear GEE model on the response time (or log-transformed response time to satisfy normality assumptions).

### 3.3. Generalized Linear Mixed-Effects Models (GLMM)
While GEE models population-averaged (marginal) effects, GLMM models subject-specific effects by adding **Random Effects** to the linear predictor.

*   **Fixed Effects**: Main independent variables (XAI Group, AI Accuracy, Interaction Group * Accuracy) and control covariates (Occupation, Device, AI Exposure).
*   **Random Effects**:
    *   `Random intercept` per subject (`(1 | User_ID)`): Controls for baseline differences in decision speed, vigilance, and competence among individuals.
    *   `Random intercept` per scenario (`(1 | Scenario_ID)`): Controls for baseline variances in difficulty across the 20 scenario files.
*   **Implementation**: Models are run in R using the `lme4` library (`glmer` for binary correctness and `lmer` for continuous decision time).

---

### AI Collaboration & Attribution Statement
*   **Technical Support & Drafting**: This document was compiled, structured, and translated with the assistance of **Antigravity (Advanced Agentic Coding Assistant from Google DeepMind)**.
*   **Scientific Design & Responsibility**: The core research objectives, experimental hypotheses, empirical data collection, and qualitative UI insights (such as task workflow ambiguity observations) are the sole intellectual product and scientific responsibility of the human researcher (thesis author).
