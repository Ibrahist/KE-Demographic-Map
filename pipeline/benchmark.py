"""
Performance benchmark script for GeoJSON parsing and spatial query latency.
"""
import time
import json
import os

def benchmark_layer(path):
    if not os.path.exists(path):
        return None
    size_mb = os.path.getsize(path) / (1024 * 1024)
    start = time.perf_counter()
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    duration_ms = (time.perf_counter() - start) * 1000
    features_count = len(data.get("features", []))
    return {
        "file": os.path.basename(path),
        "size_mb": round(size_mb, 2),
        "features": features_count,
        "parse_time_ms": round(duration_ms, 2)
    }

if __name__ == "__main__":
    layers = [
        "public/data/counties.geojson",
        "public/data/subcounties.geojson",
        "public/data/wards.geojson",
        "public/data/villages_points.geojson",
    ]
    print(f"{'Layer':30} | {'Size (MB)':10} | {'Features':10} | {'Parse (ms)':10}")
    print("-" * 68)
    for l in layers:
        res = benchmark_layer(l)
        if res:
            print(f"{res['file']:30} | {res['size_mb']:10.2f} | {res['features']:10} | {res['parse_time_ms']:10.2f}")
