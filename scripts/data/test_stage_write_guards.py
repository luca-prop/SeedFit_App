import unittest

from normalize_golden_samples import moa_stage_on_non_moa_zone, progress_marks_stage_in_progress


class StageWriteGuardsTest(unittest.TestCase):
    def test_jangwi15_moa_label_blocked(self):
        self.assertTrue(moa_stage_on_non_moa_zone("장위 15구역", "(모아)통합심의통과"))
        self.assertFalse(moa_stage_on_non_moa_zone("자양1동 779(모아타운)", "(모아)통합심의통과"))

    def test_jangwi14_in_progress_blocked(self):
        progress = "시공사선정|2010.07.11\n사업시행인가|196개월째 진행중(중앙값 36개월)"
        self.assertTrue(progress_marks_stage_in_progress("사업시행인가", progress))
        self.assertFalse(progress_marks_stage_in_progress("시공사 선정", progress))


if __name__ == "__main__":
    unittest.main()
