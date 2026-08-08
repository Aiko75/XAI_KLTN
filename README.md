# HCI Empirical Platform: Explainable AI (XAI) & Automation Bias

An empirical Human-Computer Interaction (HCI) research platform designed to evaluate the impact of different Explainable AI (XAI) fidelity levels on human **Automation Bias** (Blind Trust) and **Cognitive Workload** in high-stakes credit underwriting.

This repository is structured for review by **Professor Naomi** (Kyoto University) and partners.

---

## 1. Research Objectives & Context

In decision-support systems, providing explanations (XAI) is generally believed to increase transparency. However, from an HCI perspective, complex explanations can trigger two unintended consequences:
1.  **Automation Bias**: Users may blindly accept erroneous machine recommendations because the presence of complex charts makes the AI appear highly authoritative.
2.  **Cognitive Overload**: Overly complex XAI layouts exhaust users' attention reserves, leading to decision fatigue and increased compliance with AI decisions.

This platform tests these dynamics using 20 credit underwriting scenarios containing **adversarial traps** (AI makes obvious errors), measuring how underwriters react across three interface fidelity levels.

---

## 2. Research Methodology & Statistical Design
For the complete academic framework and equations, refer to the following documents:
*   **English version**: [Research_Methodology_and_Statistical_Design.md](docs/en/Research_Methodology_and_Statistical_Design.md) ([Word DOCX version](docs/en/Research_Methodology_and_Statistical_Design.docx))
*   **Vietnamese version**: [Research_Methodology_and_Statistical_Design.md](docs/vi/Research_Methodology_and_Statistical_Design.md) ([Word DOCX version](docs/vi/Research_Methodology_and_Statistical_Design.docx))

### Summary for Quick Reading:
The empirical study uses a **$3 \times 2$ mixed factorial design** to analyze how Explainable AI layout complexities impact credit underwriter behaviors:

1.  **Independent Variables (IVs)**:
    *   **IV1 (Between-Subjects): Explainable AI Fidelity**:
        *   *Group A (Control)*: Black-box AI (Only recommendation and confidence level).
        *   *Group B (Treatment 1)*: Static XAI (SHAP Bar Chart + natural language explanation summary).
        *   *Group C (Treatment 2)*: Interactive XAI (SHAP Force Plot + What-if analysis + Pearson Correlation Matrix + Interactive Gemini Bilingual Chatbot).
    *   **IV2 (Within-Subjects): AI Suggestion Accuracy**:
        *   *Normal Cases (14 Scenarios)*: AI predictions are accurate and business-aligned.
        *   *Trap/Adversarial Cases (6 Scenarios)*: AI predictions are intentionally flawed (e.g., recommending approval for high-risk default profiles).
2.  **Dependent Variables (DVs)**:
    *   **DV1: Trust Calibration (Decision Quality)**: Coded as `1` for detecting traps (rejecting wrong AI) or agreeing with correct AI; `0` otherwise.
    *   **DV2: Response Time (s)**: Underwriting duration spent on each credit file.
    *   **DV3: Cognitive Workload**: NASA-TLX workload scores (Mental, Temporal, Performance, Effort, Frustration, and Overall load).
3.  **Statistical Analysis Framework**:
    *   **Generalized Estimating Equations (GEE)**: Fits a logit link function for binary DV1 (Accuracy) and a linear identity link for continuous DV2 (Response Time) to compute population-averaged effects under an Autoregressive AR(1) or Exchangeable correlation structure.
    *   **Generalized Linear Mixed-Effects Models (GLMM)**: Controls for subject-specific random intercepts (`(1 | User_ID)`) and scenario-specific random intercepts (`(1 | Scenario_ID)`).

---

## 3. Experimental Group Design (A/B/C Testing)

Participants are randomly assigned to one of three interface groups:
*   **Group A (Control - Black-Box AI)**: Displays only the client's financial profile and the final AI recommendation (Approve/Reject) with its confidence level.
*   **Group B (Visual XAI)**: Adds a basic, static **SHAP Bar Chart** depicting positive (emerald) and negative (rose) feature contribution weights, accompanied by a natural language summary.
*   **Group C (Interactive & Contextual XAI)**: An advanced dashboard featuring a **SHAP Force Plot**, a **Pearson Correlation Matrix**, model metrics (ROC-AUC, Gini, Log-Loss), and an **Interactive Bilingual Chatbot (powered by Gemini API)** for free-text explanation queries.

---

## 4. Telemetry & Data Capture

To capture granular underwriter behaviors, the platform logs the following metrics to a Supabase PostgreSQL backend via Prisma ORM:
*   **Decision Metrics**: Agreement/Disagreement rate with the AI, and accuracy in detecting adversarial AI errors (traps).
*   **Time-spent (s)**: Duration spent reviewing each scenario and the introductory onboarding tutorial.
*   **Information Search Behavior**: Hover count and cumulative look-up duration (seconds) over specific client features (domain tooltips).
*   **AI Chatbot Usage**: Query counts, text input content, and response latency.
*   **Cognitive Load**: Self-assessed NASA-TLX workload scores (Mental, Temporal, Performance, Effort, Frustration, Overall Load) collected at the end of the 20-scenario session.

---

## 5. Repository Structure

```markdown
├── data/                    # Dataset and Analysis reports
│   ├── 1st test/            # Pilot phase 1 logs and reports (shuffled, optimization)
│   └── 2nd test/            # GEE methodology, real-time data reports, demographic analysis
├── docs/                    # Research documentation
│   ├── assets/              # Evaluation charts & UI screenshots
│   ├── en/                  # English Academic Documentation (Overview, Web, AI, Pilot reports)
│   ├── vi/                  # Vietnamese Academic Documentation (Tổng quan, Hệ thống, Mô hình, Pilot)
│   ├── test/                # Internal local test analysis reports
│   └── convert_to_docx.py   # Pandoc/python-docx compiler script
├── prisma/                  # Database schema (PostgreSQL)
├── public/                  # Static assets for Next.js
├── src/
│   ├── app/                 # Next.js frontend pages and API routes
│   │   ├── api/chat/        # Graceful-fallback Gemini API handler
│   │   └── page.tsx         # Main bilingual experimental interface
│   ├── components/          # Reusable React components (Charts, Survey, Glossary)
│   └── data/                # Pre-computed scenarios & translations dictionaries
└── train/                   # Python ML training & plotting scripts
```

---

## 5. Getting Started & Local Setup

### Prerequisites
*   Node.js (v18 or higher)
*   Python 3.10+ (for running training or plotting scripts in the `train/` directory)

### 1. Install Web Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
GEMINI_API_KEY="your-google-gemini-api-key"
```
*(Note: If the `GEMINI_API_KEY` is not provided or is invalid, the chatbot will automatically fall back to an offline rule-based Q&A matching mechanism based on keywords).*

### 3. Initialize the Database
Deploy the database schema via Prisma:
```bash
npx prisma db push
```

### 4. Run the Development Server
```bash
npm run dev
```
*   Access the main experimental UI: `http://localhost:3000`
*   Toggle English/Vietnamese language directly in the top header.
*   Access the Swagger API documentation: `http://localhost:3000/docs`

---

## 6. AI Collaboration & Attribution
*   **System Development & Codebase Assistance**: This empirical platform, database integration, telemetry listeners, and report compilers were co-developed with **Antigravity (Advanced Agentic Coding Assistant from Google DeepMind)**.
*   **Scientific Design & Responsibility**: The core research hypotheses, scientific design, empirical data collection, and qualitative UI insights (such as task ambiguity observations) are the sole intellectual product and scientific responsibility of the human researcher (thesis author).

