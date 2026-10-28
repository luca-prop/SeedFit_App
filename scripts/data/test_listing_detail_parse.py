#!/usr/bin/env python3
"""Premium / 초투 hint token tests for listing_detail_parse."""

from __future__ import annotations

import unittest
from pathlib import Path
import sys

_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from listing_detail_parse import extract_listing_details


def _premium(text: str) -> float | None:
    return extract_listing_details({}, description=text)["hintPremiumEok"]


class PremiumTokenTests(unittest.TestCase):
    def test_premium_word(self) -> None:
        self.assertEqual(_premium("프리미엄 3억"), 3.0)

    def test_p_letter(self) -> None:
        self.assertEqual(_premium("P 8억 초투 12억"), 8.0)
        self.assertEqual(_premium("P8억"), 8.0)

    def test_pumi(self) -> None:
        self.assertEqual(_premium("프미 2억"), 2.0)

    def test_pi_compact(self) -> None:
        self.assertEqual(_premium("청량리8구역 59B신청 감정가4억 피8억 분담금2.8억"), 8.0)

    def test_pi_with_space(self) -> None:
        self.assertEqual(_premium("피 15억"), 15.0)

    def test_pi_cheon(self) -> None:
        self.assertEqual(_premium("북아현3구역 59타입 피10억4천 등기있는지상권"), 10.4)

    def test_pi_star_prefix(self) -> None:
        self.assertEqual(_premium("*피19.4억"), 19.4)

    def test_pi_not_inside_hangul(self) -> None:
        self.assertIsNone(_premium("커피 3억 급매"))
        self.assertIsNone(_premium("피부 3억"))

    def test_decimal_eok(self) -> None:
        self.assertEqual(_premium("신길2구역 P 3.8억"), 3.8)

    def test_eok_cheonmanwon(self) -> None:
        self.assertEqual(_premium("*프리미엄 3억8천만원"), 3.8)
        self.assertEqual(_premium("프리미엄 4억6천만원"), 4.6)

    def test_eok_comma_manwon(self) -> None:
        self.assertEqual(_premium("수진1구역 59타입 P4억8,900"), 4.89)
        self.assertEqual(_premium("수진1구역 59타입 P4억7,620"), 4.762)

    def test_eok_cheon(self) -> None:
        self.assertEqual(_premium("P4억6천"), 4.6)
        self.assertEqual(_premium("프리미엄 4억6천"), 4.6)

    def test_bare_p_without_eok(self) -> None:
        self.assertEqual(_premium("p18.9"), 18.9)
        self.assertEqual(_premium("P18.9"), 18.9)


class ChotuHintTests(unittest.TestCase):
    def test_bare_chotu_without_eok(self) -> None:
        details = extract_listing_details(
            {},
            description="p18.9\n이주비 기본 40+추가 30활용으로",
            title="노량진 1구역 초투 21.4 다시 나오기 힘든 구조",
        )
        self.assertEqual(details["hintChotuEok"], 21.4)
        self.assertEqual(details["hintPremiumEok"], 18.9)

    def test_chotu_with_eok_still_works(self) -> None:
        details = extract_listing_details({}, description="초투 15.8억")
        self.assertEqual(details["hintChotuEok"], 15.8)


if __name__ == "__main__":
    unittest.main()
