import unittest
from pathlib import Path

from analyze_phase2 import build_analysis


class Phase2AnalysisTests(unittest.TestCase):
    def test_cleaned_sample_and_trap_totals_are_reproducible(self):
        analysis = build_analysis(Path(__file__).resolve().parents[2] / "data" / "2nd test" / "csv")

        self.assertEqual(analysis["sample_flow"]["registered_total"], 46)
        self.assertEqual(analysis["sample_flow"]["completed_by_group"], {"A": 12, "B": 14, "C": 12})
        self.assertEqual(analysis["sample_flow"]["retained_by_group"], {"A": 11, "B": 10, "C": 7})
        self.assertEqual(analysis["trap_detection"]["A"]["correct"], 15)
        self.assertEqual(analysis["trap_detection"]["B"]["denominator"], 39)
        self.assertEqual(analysis["trap_detection"]["C"]["correct"], 6)
        self.assertEqual(analysis["decision_accuracy"]["cleaned"]["A"]["ai_correct"]["correct"], 112)
        self.assertEqual(analysis["decision_accuracy"]["cleaned"]["C"]["ai_wrong"]["denominator"], 28)
        self.assertEqual(analysis["decision_accuracy"]["raw"]["B"]["ai_correct"]["correct"], 168)


if __name__ == "__main__":
    unittest.main()
