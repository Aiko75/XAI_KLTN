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

## 2. Experimental Group Design (A/B/C Testing)

Participants are randomly assigned to one of three interface groups:
*   **Group A (Control - Black-Box AI)**: Displays only the client's financial profile and the final AI recommendation (Approve/Reject) with its confidence level.
*   **Group B (Visual XAI)**: Adds a basic, static **SHAP Bar Chart** depicting positive (emerald) and negative (rose) feature contribution weights, accompanied by a natural language summary.
*   **Group C (Interactive & Contextual XAI)**: An advanced dashboard featuring a **SHAP Force Plot**, a **Pearson Correlation Matrix**, model metrics (ROC-AUC, Gini, Log-Loss), and an **Interactive Bilingual Chatbot (powered by Gemini API)** for free-text explanation queries.

---

## 3. Telemetry & Data Capture

To capture granular underwriter behaviors, the platform logs the following metrics to a Supabase PostgreSQL backend via Prisma ORM:
*   **Decision Metrics**: Agreement/Disagreement rate with the AI, and accuracy in detecting adversarial AI errors (traps).
*   **Time-spent (s)**: Duration spent reviewing each scenario and the introductory onboarding tutorial.
*   **Information Search Behavior**: Hover count and cumulative look-up duration (seconds) over specific client features (domain tooltips).
*   **AI Chatbot Usage**: Query counts, text input content, and response latency.
*   **Cognitive Load**: Self-assessed NASA-TLX workload scores (Mental, Temporal, Performance, Effort, Frustration, Overall Load) collected at the end of the 20-scenario session.

---

## 4. Repository Structure

```markdown
├── data/                    # Cleaned credit risk dataset
├── docs/                    # Research documentation
│   ├── assets/              # Evaluation charts & UI screenshots
│   ├── en/                  # English Academic Documentation
│   │   ├── 1_Project_Overview.md / .docx
│   │   ├── 2_Web_System_Documentation.md / .docx
│   │   ├── 3_AI_Model_Documentation.md / .docx
│   │   └── 4_Pilot_Experiment_Report.md / .docx
│   ├── vi/                  # Vietnamese Academic Documentation
│   │   ├── 1_Tong_Quan_De_Tai.md / .docx
│   │   ├── 2_Tai_Lieu_He_Thong_Web.md / .docx
│   │   ├── 3_Tai_Lieu_Mo_Hinh_AI.md / .docx
│   │   └── 4_Bao_Cao_Thuc_Nghiem_So_Bo.md / .docx
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
