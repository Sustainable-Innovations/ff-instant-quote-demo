import math
import struct
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.slicer import (
    SliceError,
    analyze_binary_stl,
    build_prusa_config,
    center_binary_stl,
    orientation_candidates,
    parse_duration_seconds,
    parse_gcode_stats,
    slice_with_prusa,
)


def cube_stl(size=10.0, origin=(0.0, 0.0, 0.0)):
    x0, y0, z0 = origin
    sx, sy, sz = size if isinstance(size, tuple) else (size, size, size)
    x1, y1, z1 = x0 + sx, y0 + sy, z0 + sz
    v = [
        (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
    ]
    faces = [
        (0, 2, 1), (0, 3, 2), (4, 5, 6), (4, 6, 7),
        (0, 1, 5), (0, 5, 4), (1, 2, 6), (1, 6, 5),
        (2, 3, 7), (2, 7, 6), (3, 0, 4), (3, 4, 7),
    ]
    out = bytearray(84 + len(faces) * 50)
    struct.pack_into("<I", out, 80, len(faces))
    off = 84
    for a, b, c in faces:
        ax, ay, az = v[a]
        bx, by, bz = v[b]
        cx, cy, cz = v[c]
        ux, uy, uz = bx - ax, by - ay, bz - az
        vx, vy, vz = cx - ax, cy - ay, cz - az
        nx, ny, nz = uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx
        ln = math.sqrt(nx * nx + ny * ny + nz * nz) or 1
        struct.pack_into("<fff", out, off, nx / ln, ny / ln, nz / ln)
        off += 12
        for idx in (a, b, c):
            struct.pack_into("<fff", out, off, *v[idx])
            off += 12
        struct.pack_into("<H", out, off, 0)
        off += 2
    return bytes(out)


class SlicerHelperTests(unittest.TestCase):
    def test_center_binary_stl_moves_cube_to_bed_center(self):
        data, info = center_binary_stl(cube_stl(10, origin=(100, -25, 4)), {"x": 200, "y": 100, "z": 80})
        self.assertEqual(info["triangles"], 12)
        xs, ys, zs = [], [], []
        for i in range(12):
            tri = 84 + i * 50
            for vertex in range(3):
                x, y, z = struct.unpack_from("<fff", data, tri + 12 + vertex * 12)
                xs.append(x); ys.append(y); zs.append(z)
        self.assertAlmostEqual(min(xs), 95)
        self.assertAlmostEqual(max(xs), 105)
        self.assertAlmostEqual(min(ys), 45)
        self.assertAlmostEqual(max(ys), 55)
        self.assertAlmostEqual(min(zs), 0)
        self.assertAlmostEqual(max(zs), 10)

    def test_center_binary_stl_rejects_oversized_part(self):
        with self.assertRaises(SliceError):
            center_binary_stl(cube_stl(120), {"x": 100, "y": 100, "z": 100})

    def test_orientation_candidates_include_flattened_trials(self):
        candidates = orientation_candidates(cube_stl((10, 20, 80)), {"x": 100, "y": 100, "z": 100}, optimize=True)
        dims = {c["name"]: c["mesh"]["bbox"] for c in candidates if c.get("mesh")}
        self.assertEqual(dims["original"]["z"], 80)
        self.assertEqual(dims["lay_x"]["z"], 20)
        self.assertEqual(dims["lay_y"]["z"], 10)
        self.assertLessEqual(len([c for c in candidates if c.get("mesh")]), 6)

    def test_analyze_binary_stl_reports_quality_and_risks(self):
        analysis = analyze_binary_stl(cube_stl(10))
        self.assertEqual(analysis["properties"]["triCount"], 12)
        self.assertEqual(analysis["quality"]["badEdges"], 0)
        self.assertEqual(analysis["quality"]["shellCount"], 1)
        self.assertIn("overhangFaces", analysis["risks"])
        self.assertEqual(len(analysis["riskClasses"]), 12)

    def test_build_prusa_config_uses_machine_and_params(self):
        cfg = build_prusa_config(
            {"envelope": {"x": 256, "y": 256, "z": 256}, "build": {"supportFraction": 0.12}},
            {"baseLayerHeight": 0.2},
            {"density": 1.24},
            {"layerHeight": 0.16, "infill": 35},
        )
        self.assertIn("bed_shape = 0x0,256.000x0,256.000x256.000,0x256.000", cfg)
        self.assertIn("layer_height = 0.160", cfg)
        self.assertIn("fill_density = 35%", cfg)
        self.assertIn("support_material = 1", cfg)

    def test_build_prusa_config_maps_quality_to_layer_height(self):
        cfg = build_prusa_config(
            {"envelope": {"x": 256, "y": 256, "z": 256}, "build": {}},
            {"baseLayerHeight": 0.2, "params": {"quality": {"options": [
                {"value": "draft", "layerHeight": 0.28},
                {"value": "fine", "layerHeight": 0.12},
            ]}}},
            {"density": 1.24},
            {"quality": "fine", "infill": 20},
        )
        self.assertIn("layer_height = 0.120", cfg)

    def test_parse_prusaslicer_gcode_comments(self):
        stats = parse_gcode_stats("""
; estimated printing time (normal mode) = 1h 2m 3s
; filament used [g] = 12.5
G1 X10 F600
""")
        self.assertEqual(stats["timeSec"], 3723)
        self.assertEqual(stats["gramsModel"], 12.5)

    def test_parse_duration_variants(self):
        self.assertEqual(parse_duration_seconds("2h 5m"), 7500)
        self.assertEqual(parse_duration_seconds("1 day 1 hour 1 minute 1 second"), 90061)

    def test_slice_with_prusa_mocked_cli(self):
        def fake_run(cmd, **kwargs):
            out = Path(cmd[cmd.index("--output") + 1])
            out.write_text("; estimated printing time (normal mode) = 10m 5s\n; filament used [g] = 4.2\n", encoding="utf-8")
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")

        with patch("app.slicer.subprocess.run", side_effect=fake_run):
            result = slice_with_prusa(
                cube_stl(10),
                {"envelope": {"x": 200, "y": 200, "z": 200}, "build": {}},
                {"baseLayerHeight": 0.2},
                {"density": 1.24},
                {"layerHeight": 0.2, "infill": 20},
            )
        self.assertTrue(result["ok"])
        self.assertEqual(result["source"], "sliced")
        self.assertEqual(result["timeSec"], 605)
        self.assertEqual(result["gramsModel"], 4.2)
        self.assertEqual(result["selectedOrientation"]["name"], "original")
        self.assertIn("orientationScore", result)
        self.assertIn("analysis", result)

    def test_slice_with_prusa_selects_best_balanced_orientation(self):
        def fake_run(cmd, **kwargs):
            out = Path(cmd[cmd.index("--output") + 1])
            if "lay_x" in out.name:
                duration = "8m"
            elif "lay_y" in out.name:
                duration = "12m"
            else:
                duration = "20m"
            out.write_text(f"; estimated printing time (normal mode) = {duration}\n; filament used [g] = 4.2\n", encoding="utf-8")
            return subprocess.CompletedProcess(cmd, 0, stdout="", stderr="")

        with patch("app.slicer.subprocess.run", side_effect=fake_run):
            result = slice_with_prusa(
                cube_stl((10, 20, 80)),
                {"envelope": {"x": 100, "y": 100, "z": 100}, "build": {}},
                {"baseLayerHeight": 0.2},
                {"density": 1.24},
                {"layerHeight": 0.2, "infill": 20, "optimizeOrientation": True},
            )
        self.assertEqual(result["timeSec"], 480)
        self.assertEqual(result["selectedOrientation"]["name"], "lay_x")
        self.assertEqual(len([t for t in result["trials"] if t.get("timeSec")]), 3)


if __name__ == "__main__":
    unittest.main()
