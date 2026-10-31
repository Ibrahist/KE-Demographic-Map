"""
Automated GeoJSON schema and spatial integrity tests.
"""
import os
import json
import unittest

class TestGeoJsonIntegrity(unittest.TestCase):
    def test_counties_geojson_validity(self):
        self.assertTrue(os.path.exists("public/data/counties.geojson"))
        with open("public/data/counties.geojson", "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["type"], "FeatureCollection")
        self.assertEqual(len(data["features"]), 47)
        for feat in data["features"]:
            self.assertIn("name", feat["properties"])
            self.assertIn("code", feat["properties"])
            self.assertIn("pop_total", feat["properties"])
            self.assertIn(feat["geometry"]["type"], ["Polygon", "MultiPolygon"])

    def test_subcounties_geojson_validity(self):
        self.assertTrue(os.path.exists("public/data/subcounties.geojson"))
        with open("public/data/subcounties.geojson", "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["type"], "FeatureCollection")
        self.assertGreaterEqual(len(data["features"]), 290)

    def test_wards_geojson_validity(self):
        self.assertTrue(os.path.exists("public/data/wards.geojson"))
        with open("public/data/wards.geojson", "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["type"], "FeatureCollection")
        self.assertEqual(len(data["features"]), 1450)

if __name__ == "__main__":
    unittest.main()
