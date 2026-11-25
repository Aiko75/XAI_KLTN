# Thesis Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a verifiable DOCX thesis with at least 50 rendered pages from Mở đầu through Kết luận, using only repository artefacts, exported experiment data, and cited academic sources.

**Architecture:** The existing `docs/thesis/build_phase1.py` remains the single DOCX builder. A reproducible analysis helper derives every new Chapter 4 aggregate from the phase-2 CSV exports; the builder imports its tables and evidence-grounded narrative. Rendered PNGs are the acceptance source for page count and layout, while the chapter/body boundary is verified from the rendered page map.

**Tech Stack:** Python 3 bundled runtime, python-docx, LibreOffice renderer, CSV exports, Next.js source files, Prisma schema.

**Spec:** `docs/superpowers/specs/2026-09-22-thesis-expansion-design.md`

## Global Constraints

- Use only information traceable to repository code, database schema, images, CSV exports, or cited literature.
- Do not invent metrics, feature behavior, statistical tests, causal claims, or participant facts.
- Keep appendices separate from the 50-page main-content target.
- Retain Times New Roman 13, 1.3 line spacing and 2.5–2.5–3.5–2.5 cm main-body margins.
- Use 18pt bold centered uppercase chapter headings; place table captions above tables and figure captions below figures.
- Do not change or restore the user’s existing staged/deleted data files.

## Review Focus

- CSV rows with incomplete sessions must follow the documented time-based cleaning rule and never silently enter an aggregate.
- A scenario classified as an AI-error trap must be counted only when `is_correct_on_error_case` is present and true.
- Derived values must retain numerator and denominator where sample sizes differ across groups.
- Every added screenshot must correspond to an existing interface/component and have a caption/source in the thesis.
- The body-page counter must exclude front matter, references and appendices even if total document pages exceed 50.

---

### Task 1: Create reproducible phase-2 analysis output

**Files:**
- Create: `docs/thesis/analyze_phase2.py`
- Create: `docs/thesis/phase2_analysis.json`
- Modify: `docs/thesis/build_phase1.py`
- Test: command-line assertions embedded in `docs/thesis/analyze_phase2.py`

**Interfaces:**
- Consumes: `data/2nd test/csv/users_rows.csv`, `response_logs_rows.csv`, `survey_logs_rows.csv`.
- Produces: JSON object with `sample_flow`, `trap_detection`, `scenario_summary`, `interaction_summary`, and `workload_summary`.

- [ ] **Step 1: Add an executable assertion for source rows and group counts**

```python
assert len(users) == 46
assert completed_by_group == {"A": 12, "B": 14, "C": 12}
```

- [ ] **Step 2: Run the helper before implementation**

Run: `python docs/thesis/analyze_phase2.py`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement session cleaning and the derived aggregates**

```python
THRESHOLD_SECONDS = {"A": 2.0, "B": 3.0, "C": 4.0}
TRAP_SCENARIOS = {1, 8, 11, 16}

def keep_valid_prefix(rows, threshold):
    """Keep responses before the first three-response run below threshold."""
```

The helper must sort rows by user and scenario/time order, preserve the prefix before the first three-response run below the group threshold, retain a session only with at least ten valid responses, and write JSON with the resulting denominators.

- [ ] **Step 4: Run the assertion-backed analysis**

Run: `python docs/thesis/analyze_phase2.py`

Expected: PASS and JSON reports 28 retained sessions split A=11, B=10, C=7; trap counts A=15/44, B=14/39, C=6/28.

- [ ] **Step 5: Commit the analysis helper only after its output is checked**

```bash
git add docs/thesis/analyze_phase2.py docs/thesis/phase2_analysis.json
git commit -m "docs: add reproducible phase 2 analysis"
```

### Task 2: Expand theory chapters with source-backed content

**Files:**
- Modify: `docs/thesis/build_phase1.py:351-407`
- Modify: `docs/thesis/KLTN_Tran_Ngoc_Nhan_Dot_1.docx`
- Test: text/heading audit script run against generated DOCX

**Interfaces:**
- Consumes: the existing IEEE reference list and citations already used in Chapters 1–2.
- Produces: Chapter 1 target 6 pages and Chapter 2 target 12 pages without unreferenced literature claims.

- [ ] **Step 1: Add checks for Chapter 1 and Chapter 2 section headings**

```python
required = [
    "1.5. Đóng góp dự kiến của khóa luận",
    "2.6. Khung khái niệm cho nghiên cứu",
]
assert all(item in document_text for item in required)
```

- [ ] **Step 2: Run the audit before expanding content**

Run: `python -c "from docx import Document; print(len(Document(r'docs/thesis/KLTN_Tran_Ngoc_Nhan_Dot_1.docx').paragraphs))"`

Expected: Existing document is present but Chapters 1–2 do not meet their planned page allocation after render.

- [ ] **Step 3: Add evidence-backed theory material**

Add sections on credit decision-support context, human responsibility, automation bias mechanisms, explanation properties, calibrated trust, cognitive workload, and comparison with prior human-AI studies. Every non-common claim must have a valid IEEE citation; retain uncertainty where the literature is not conclusive.

- [ ] **Step 4: Rebuild and render after Chapter 1–2 expansion**

Run: `python docs/thesis/build_phase1.py` followed by `render_docx.py docs/thesis/KLTN_Tran_Ngoc_Nhan_Dot_1.docx --output_dir docs/thesis/.qa-theory`

Expected: All pages display cleanly, and Chapter 1 begins/ends at approximately six pages and Chapter 2 at approximately twelve pages.

- [ ] **Step 5: Commit only the builder after rendered verification**

```bash
git add docs/thesis/build_phase1.py
git commit -m "docs: expand theoretical foundation"
```

### Task 3: Expand technical methodology from actual system artefacts

**Files:**
- Modify: `docs/thesis/build_phase1.py:409-468`
- Read: `prisma/schema.prisma`, `src/lib/rfPredictor.ts`, `src/lib/features.ts`, `src/data/scenarios.json`
- Read: `src/app/api/users/start/route.ts`, `src/app/api/responses/route.ts`, `src/app/api/survey/route.ts`
- Test: DOCX structural audit and render for Chapter 3 pages

**Interfaces:**
- Consumes: system source, Prisma data models, API routes and existing chapter-3 screenshots.
- Produces: A 17-page Chapter 3 that describes actual architecture, storage, interface conditions, logging, protocol and data handling.

- [ ] **Step 1: Check that every technical assertion has a repository source**

```python
required_paths = [
    "prisma/schema.prisma",
    "src/lib/rfPredictor.ts",
    "src/app/api/responses/route.ts",
]
assert all(Path(path).exists() for path in required_paths)
```

- [ ] **Step 2: Run the source-existence check before adding Chapter 3 detail**

Run: `python -c "from pathlib import Path; assert Path('prisma/schema.prisma').exists()"`

Expected: PASS.

- [ ] **Step 3: Add architecture and protocol subsections**

Document the User/ResponseLog/SurveyLog schema, scenario feature flow, model-output presentation, group A/B/C interface distinction, user start/response/survey/finish APIs, response telemetry fields, 20-scenario protocol, post-session survey, and cleaning rationale. Include only existing screenshots; caption and cite every image in prose.

- [ ] **Step 4: Rebuild and visually inspect the complete Chapter 3 sequence**

Run: `python docs/thesis/build_phase1.py` and `render_docx.py ... --output_dir docs/thesis/.qa-method`

Expected: Chapter 3 contains no text overlap, every figure is referenced, and rendered allocation is approximately 17 pages.

- [ ] **Step 5: Commit the technical-methodology expansion after render QA**

```bash
git add docs/thesis/build_phase1.py
git commit -m "docs: document experiment methodology"
```

### Task 4: Expand empirical results with reproducible tables and figures

**Files:**
- Modify: `docs/thesis/build_phase1.py:470-536`
- Read: `docs/thesis/phase2_analysis.json`
- Create: `docs/thesis/assets/chapter4/*.png` only for plots generated from analysis output
- Test: recomputation assertions and visual render checks

**Interfaces:**
- Consumes: `phase2_analysis.json` from Task 1.
- Produces: A 13-page Chapter 4 with audit-ready tables/figures and cautious descriptive interpretation.

- [ ] **Step 1: Assert the published trap-detection totals before writing tables**

```python
assert analysis["trap_detection"]["A"]["correct"] == 15
assert analysis["trap_detection"]["B"]["denominator"] == 39
assert analysis["trap_detection"]["C"]["correct"] == 6
```

- [ ] **Step 2: Run the analysis helper before generating Chapter 4 material**

Run: `python docs/thesis/analyze_phase2.py`

Expected: PASS.

- [ ] **Step 3: Generate figures from actual aggregates and add detailed result subsections**

Create charts only for sample flow, per-scenario valid response/decision outcomes, trap detection, time/interaction measures and workload means. Explain denominators, missing values, two partial sessions, adaptive assignment and why results are descriptive rather than causal.

- [ ] **Step 4: Render and inspect all Chapter 4 pages at 100%**

Run: `render_docx.py docs/thesis/KLTN_Tran_Ngoc_Nhan_Dot_1.docx --output_dir docs/thesis/.qa-results --emit_pdf`

Expected: Tables use captions above, figures use captions below, no chart/table is clipped, and Chapter 4 renders to approximately 13 pages.

- [ ] **Step 5: Commit analysis-derived figures and builder**

```bash
git add docs/thesis/analyze_phase2.py docs/thesis/phase2_analysis.json docs/thesis/assets/chapter4 docs/thesis/build_phase1.py
git commit -m "docs: expand empirical results"
```

### Task 5: Correct compliance formatting, appendices and final page audit

**Files:**
- Modify: `docs/thesis/build_phase1.py`
- Modify: `docs/thesis/KLTN_Tran_Ngoc_Nhan_Dot_1.docx`
- Create: `docs/thesis/assets/appendix/` only for existing system/data screenshots reused with attribution
- Test: final page map, heading/font audit, caption-placement check and render review

**Interfaces:**
- Consumes: final chapter content, figures and tables from Tasks 1–4.
- Produces: a submission-ready DOCX, excluding hand signatures and Turnitin report which require user/institution action.

- [ ] **Step 1: Add hard acceptance assertions to the build verification command**

```python
assert main_content_pages >= 50
assert all(size == 18 for size in chapter_heading_sizes)
assert not any(token in text for token in ["TÊN NGÀNH", "TÊN SV", "MÃ SV"])
```

- [ ] **Step 2: Run final verification before format fixes**

Run: `python docs/thesis/build_phase1.py` and `render_docx.py ... --output_dir docs/thesis/.qa-final`

Expected: Current page count/format audit fails one or more acceptance assertions.

- [ ] **Step 3: Apply final document compliance changes**

Set chapter headings to 18pt; move every table caption above its table; update spine fields when the academic year/term is confirmed; preserve manual signature spaces; create a non-counted appendix for data dictionary, scenario catalogue and system operation notes; update TOC/list fields and IEEE references.

- [ ] **Step 4: Render, inspect and count final body pages**

Run: `render_docx.py docs/thesis/KLTN_Tran_Ngoc_Nhan_Dot_1.docx --output_dir docs/thesis/.qa-final --emit_pdf`

Expected: all rendered pages are visually clean; Mở đầu through Kết luận is at least 50 pages; appendix and references begin after the body.

- [ ] **Step 5: Commit only files authored for this thesis expansion**

```bash
git add docs/thesis/build_phase1.py docs/thesis/analyze_phase2.py docs/thesis/phase2_analysis.json docs/thesis/assets docs/thesis/KLTN_Tran_Ngoc_Nhan_Dot_1.docx
git commit -m "docs: complete thesis expansion and compliance review"
```

## Self-Review

- Spec coverage: Tasks 1–5 cover data reproducibility, content expansion, technical evidence, chapter/page targets, format corrections, appendices and final render verification.
- Placeholder scan: no implementation placeholders are used; manually supplied signature and academic-term information are intentionally outside automated generation.
- Interface consistency: Task 1 produces `phase2_analysis.json`, which is the sole aggregate input for Task 4; Task 5 consumes the final builder output from Tasks 2–4.
- Review-focus coverage: Tasks 1 and 4 test incomplete sessions, trap fields and denominators; Task 3 validates source artefacts; Tasks 4–5 visually validate caption placement and count only main-content pages.
