# Template execution contract

- Reference: `D:\My_projects\XAI_KLTN\docs\thesis\NEU_FIT_thesis_template.docx`
- SHA-256: `B72AB6BFE78B075B1E30D19763DFF1FAB5AE7993CE6BF6BC5A7EAB79C6C4D43B`
- Sections: four portrait A4 sections. Their observed margins are (inches):
  1. L 1.57, R 0.79, T 0.98, B 0.98;
  2. L 1.18, R 0.79, T 0.98, B 0.98;
  3. L 1.38, R 0.98, T 0.98, B 0.98;
  4. L 1.18, R 0.79, T 0.98, B 0.98.
- Template slot map: first cover contains title (paragraph 10), author (16), supervisor (17), date (22). The inner cover contains title (31), author (35), student ID (36), class (37), major (38), faculty (39), supervisor (40), and date (49).
- Typography: Times New Roman is the source typeface. The source cover uses direct formatting; no source heading style may be assumed.
- Preservation: the reference file is retained untouched. The output retains source-derived cover content and begins a fresh content section using NEU-prescribed 2.5 cm top/bottom/right and 3.5 cm left margins.
- Fields: `w:updateFields` is enabled. Word must refresh field results on open; a dynamic TOC will be installed after the full heading structure is complete.
- QA gates: render every output page, inspect at 100% zoom, verify no cover-slot overflow, no clipping in body/table cells, and that reference SHA-256 is unchanged.
