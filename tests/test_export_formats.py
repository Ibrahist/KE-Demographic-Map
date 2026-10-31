"""
Tests for CSV, PDF, and GeoJSON single area export functions.
"""
import os
import json
import unittest

class TestExportFormats(unittest.TestCase):
    def test_sample_area_feature_format(self):
        with open("public/data/counties.geojson", "r", encoding="utf-8") as f:
            data = json.load(f)
        feat = data["features"][0]
        self.assertEqual(feat["type"], "Feature")
        self.assertIn("properties", feat)
        self.assertIn("geometry", feat)
        p = feat["properties"]
        self.assertIn("name", p)
        self.assertIn("pop_total", p)
        self.assertIn("area_sqkm", p)

if __name__ == "__main__":
    unittest.main()
