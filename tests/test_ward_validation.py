"""
Ward validation and demographic integrity tests.
"""
import os
import json
import unittest

class TestWardValidation(unittest.TestCase):
    def test_all_wards_have_valid_parents(self):
        with open("public/data/wards.geojson", "r", encoding="utf-8") as f:
            data = json.load(f)
        for feat in data["features"]:
            p = feat["properties"]
            self.assertTrue(bool(p.get("name")), f"Ward missing name: {p}")
            self.assertTrue(bool(p.get("county_name")), f"Ward missing county_name: {p}")
            self.assertIsNotNone(p.get("county_code"), f"Ward missing county_code: {p}")
            self.assertGreater(p.get("pop_total", 0), 0, f"Ward zero pop: {p.get('name')}")

if __name__ == "__main__":
    unittest.main()
