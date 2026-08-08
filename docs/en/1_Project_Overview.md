# Document 1: Research Project Overview (Explainable AI & Automation Bias)

This document provides a comprehensive overview of the research project, detailing its scientific rationale, experimental methodology, and technical architecture designed to study Human-Computer Interaction (HCI) in decision-support systems.

---

## 1. Abstract & Rationale

As Machine Learning (ML) models are increasingly deployed in high-stakes domains (e.g., medical diagnosis, judicial sentencing, and financial underwriting), human decision-makers rely on automated recommendations. However, this reliance often introduces two cognitive biases:
*   **Automation Bias (Decision Conformity)**: The tendency of humans to blindly trust and accept machine recommendations without verification.
*   **Cognitive Overload**: The mental exhaustion caused by displaying overly complex explanations (over-explanation), which paradoxically increases automation bias.

This research project designs an empirical HCI platform to evaluate how different levels of **Explainable AI (XAI)** explanations affect the rate of Automation Bias and the resulting cognitive load of credit underwriters.

---

## 2. Research Questions & Hypotheses

The study is guided by three core research questions:
1.  **RQ1**: Does providing feature-level explanations (XAI) decrease human automation bias compared to black-box systems, or does it inadvertently increase trust?
2.  **RQ2**: How does the complexity of XAI (e.g., interactive chatbots, Pearson matrices, SHAP charts) affect the cognitive workload (NASA-TLX) of underwriters?
3.  **RQ3**: Can underwriters successfully detect adversarial recommendation errors (traps) embedded in the AI system under different interfaces?

### Hypotheses:
*   **H1**: Basic visual XAI (SHAP bar charts) reduces automation bias and increases trap detection compared to black-box models.
*   **H2**: Overly complex contextual XAI (Group C) increases cognitive load, leading to fatigue and a higher rate of automation bias (Blind Trust).

---

## 3. Experimental Group Design

To test the hypotheses, participants are randomly assigned to one of three experimental groups:

| Feature / UI Component | Group A (Black-box AI) | Group B (Visual XAI) | Group C (Interactive & Contextual XAI) |
| :--- | :---: | :---: | :---: |
| **AI Recommendation** | Yes (Approve/Reject) | Yes (Approve/Reject) | Yes (Approve/Reject) |
| **Model Confidence** | Yes (Percentage) | Yes (Percentage) | Yes (Percentage) |
| **Feature Tooltips** | Yes (Basic Business Glossary) | Yes | Yes |
| **SHAP Bar Chart** | No | Yes (Visual weights) | Yes (Visual weights) |
| **Natural Language Explanations** | No | Yes (Basic summary) | Yes (Advanced synthesis) |
| **SHAP Force Plot** | No | No | Yes (Forces timeline) |
| **Decision Mathematics** | No | No | Yes (Logit equation + Pearson Correlation) |
| **Gemini Interactive Chatbot** | No | No | Yes (Bilingual query explainer) |

---

## 4. Key Experimental Variables

The system automatically measures and records the following metrics:
*   **Independent Variable**: The assigned experimental interface group (A, B, or C).
*   **Dependent Variables**:
    1.  **Agreement Rate**: The percentage of times the participant agrees with the AI recommendation.
    2.  **Decision Time (s)**: Measured from scenario load to decision submission.
    3.  **Trap Detection Accuracy**: Success rate in identifying the 4 adversarial credit profiles (where the AI makes an obvious error).
    4.  **NASA-TLX Workload Scores**: Self-assessed cognitive load across 6 dimensions (Mental, Temporal, Performance, Effort, Frustration, Overall).
    5.  **Interactive Behaviors**: Mouse hover counts, hover durations per feature, and chatbot conversation records.

---

### AI Collaboration & Attribution Statement
*   **Technical Support & Drafting**: This document was compiled, structured, and translated with the assistance of **Antigravity (Advanced Agentic Coding Assistant from Google DeepMind)**.
*   **Scientific Design & Responsibility**: The core research objectives, experimental hypotheses, empirical data collection, and qualitative UI insights (such as task workflow ambiguity observations) are the sole intellectual product and scientific responsibility of the human researcher (thesis author).

