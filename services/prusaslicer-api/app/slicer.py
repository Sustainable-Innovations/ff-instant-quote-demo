import math
import os
import re
import shutil
import struct
import subprocess
import tempfile
import time
from pathlib import Path


FILAMENT_DIAMETER_MM = 1.75
DEFAULT_DENSITY_G_CM3 = 1.24


class SliceError(Exception):
    pass


def number(value, fallback):
    try:
        n = float(value)
        return n if math.isfinite(n) else fallback
    except (TypeError, ValueError):
        return fallback


def envelope_from_machine(machine):
    env = (machine or {}).get("envelope") or {}
    return {
        "x": number(env.get("x"), 250.0),
        "y": number(env.get("y"), 210.0),
        "z": number(env.get("z"), 220.0),
    }


def _binary_stl_count(data):
    if len(data) < 84:
        raise SliceError("STL is too small")
    count = struct.unpack_from("<I", data, 80)[0]
    expected = 84 + count * 50
    if count <= 0 or len(data) < expected:
        raise SliceError("only binary STL is supported")
    return count


def center_binary_stl(data, envelope):
    """Center a binary STL on the build plate and place its bottom at Z=0."""
    count = _binary_stl_count(data)
    out = bytearray(data[: 84 + count * 50])
    mins = [float("inf"), float("inf"), float("inf")]
    maxs = [float("-inf"), float("-inf"), float("-inf")]

    for i in range(count):
        tri = 84 + i * 50
        for vertex in range(3):
            off = tri + 12 + vertex * 12
            coords = struct.unpack_from("<fff", out, off)
            for axis, val in enumerate(coords):
                mins[axis] = min(mins[axis], val)
                maxs[axis] = max(maxs[axis], val)

    dims = [maxs[i] - mins[i] for i in range(3)]
    if dims[0] > envelope["x"] + 1e-4 or dims[1] > envelope["y"] + 1e-4 or dims[2] > envelope["z"] + 1e-4:
        raise SliceError(
            f"part exceeds machine envelope ({dims[0]:.1f}x{dims[1]:.1f}x{dims[2]:.1f} mm > "
            f"{envelope['x']:.1f}x{envelope['y']:.1f}x{envelope['z']:.1f} mm)"
        )

    dx = envelope["x"] / 2 - (mins[0] + maxs[0]) / 2
    dy = envelope["y"] / 2 - (mins[1] + maxs[1]) / 2
    dz = -mins[2]

    for i in range(count):
        tri = 84 + i * 50
        for vertex in range(3):
            off = tri + 12 + vertex * 12
            x, y, z = struct.unpack_from("<fff", out, off)
            struct.pack_into("<fff", out, off, x + dx, y + dy, z + dz)

    return bytes(out), {
        "triangles": count,
        "bbox": {"x": dims[0], "y": dims[1], "z": dims[2]},
    }


def _orientation_transform(name, x, y, z):
    if name == "lay_x":
        return x, z, -y
    if name == "lay_y":
        return z, y, -x
    if name == "low_height":
        return z, y, -x
    if name == "largest_face_down":
        return x, z, -y
    return x, y, z


def orient_binary_stl(data, orientation):
    count = _binary_stl_count(data)
    out = bytearray(data[: 84 + count * 50])
    for i in range(count):
        tri = 84 + i * 50
        nx, ny, nz = struct.unpack_from("<fff", out, tri)
        struct.pack_into("<fff", out, tri, *_orientation_transform(orientation, nx, ny, nz))
        for vertex in range(3):
            off = tri + 12 + vertex * 12
            x, y, z = struct.unpack_from("<fff", out, off)
            struct.pack_into("<fff", out, off, *_orientation_transform(orientation, x, y, z))
    return bytes(out)


def _bbox_key(mesh_info):
    dims = mesh_info["bbox"]
    return (round(dims["x"], 3), round(dims["y"], 3), round(dims["z"], 3))


def orientation_candidates(stl_bytes, envelope, optimize=True, max_candidates=6):
    base = [
        ("original", "Original orientation", "as-uploaded"),
        ("lay_x", "Lay X side flat", "axis-lay"),
        ("lay_y", "Lay Y side flat", "axis-lay"),
        ("low_height", "Lowest height candidate", "low-height"),
        ("largest_face_down", "Largest face down candidate", "bed-contact"),
    ] if optimize else [("original", "Original orientation", "as-uploaded")]

    candidates = []
    seen = set()
    for name, label, reason in base:
        oriented = orient_binary_stl(stl_bytes, name)
        try:
            normalized, mesh_info = center_binary_stl(oriented, envelope)
        except SliceError as exc:
            candidates.append({ "name": name, "label": label, "error": str(exc) })
            continue
        key = _bbox_key(mesh_info)
        if key in seen:
            continue
        seen.add(key)
        pre = pre_score_candidate(mesh_info)
        candidates.append({
            "name": name,
            "label": label,
            "reason": reason,
            "stl": normalized,
            "mesh": mesh_info,
            "preScore": pre,
        })
    fit = [c for c in candidates if not c.get("error")]
    errors = [c for c in candidates if c.get("error")]
    fit.sort(key=lambda c: c.get("preScore", 999))
    return fit[:max_candidates] + errors


def pre_score_candidate(mesh_info):
    dims = mesh_info["bbox"]
    bed_area = max(1.0, dims["x"] * dims["y"])
    height = dims["z"]
    return height * 0.65 - math.log(bed_area) * 8


def analyze_binary_stl(data, overhang_deg=45, thin_wall_mm=1.0):
    count = _binary_stl_count(data)
    mins = [float("inf"), float("inf"), float("inf")]
    maxs = [float("-inf"), float("-inf"), float("-inf")]
    edges = {}
    edge_to_tri = {}
    parent = list(range(count))
    volume = 0.0
    surface = 0.0
    overhang = 0
    bridges = 0
    thin = 0
    risk_classes = []
    tri_contact_metrics = []
    weld = 1e-5

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    def vid(v):
        return (round(v[0] / weld), round(v[1] / weld), round(v[2] / weld))

    overhang_cos = math.cos(math.radians(overhang_deg))
    for i in range(count):
        tri = 84 + i * 50
        verts = [struct.unpack_from("<fff", data, tri + 12 + j * 12) for j in range(3)]
        for v in verts:
            for axis, val in enumerate(v):
                mins[axis] = min(mins[axis], val)
                maxs[axis] = max(maxs[axis], val)
        a, b, c = verts
        ab = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
        ac = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
        nx = ab[1] * ac[2] - ab[2] * ac[1]
        ny = ab[2] * ac[0] - ab[0] * ac[2]
        nz = ab[0] * ac[1] - ab[1] * ac[0]
        area2 = math.sqrt(nx * nx + ny * ny + nz * nz)
        area = area2 / 2
        surface += area
        volume += (a[0] * (b[1] * c[2] - b[2] * c[1]) + a[1] * (b[2] * c[0] - b[0] * c[2]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6
        klass = 0
        normal_z = nz / area2 if area2 else 0
        tri_contact_metrics.append((min(a[2], b[2], c[2]), area, normal_z))
        if normal_z < -overhang_cos:
            overhang += 1
            klass = max(klass, 1)
            if normal_z < -0.9:
                bridges += 1
        edge_lens = [
            math.dist(a, b),
            math.dist(b, c),
            math.dist(c, a),
        ]
        if min(edge_lens) > 0 and min(edge_lens) < thin_wall_mm:
            thin += 1
            klass = 2
        risk_classes.append(klass)
        vids = [vid(v) for v in verts]
        for p, q in [(vids[0], vids[1]), (vids[1], vids[2]), (vids[2], vids[0])]:
            key = tuple(sorted([p, q]))
            edges[key] = edges.get(key, 0) + 1
            if key in edge_to_tri:
                union(edge_to_tri[key], i)
            else:
                edge_to_tri[key] = i

    boundary = sum(1 for v in edges.values() if v == 1)
    nonmanifold = sum(1 for v in edges.values() if v > 2)
    bad = boundary + nonmanifold
    shells = len({find(i) for i in range(count)}) if count else 0
    bbox = {"x": maxs[0] - mins[0], "y": maxs[1] - mins[1], "z": maxs[2] - mins[2]}
    z_tol = max(0.05, bbox["z"] * 0.002)
    bed_contact_area = sum(
        area for z_min, area, normal_z in tri_contact_metrics
        if z_min <= mins[2] + z_tol and normal_z < -0.5
    )
    return {
        "properties": {
            "dimensions_mm": bbox,
            "volume_mm3": abs(volume),
            "surface_mm2": surface,
            "triCount": count,
            "bedContactArea_mm2": bed_contact_area,
        },
        "quality": {
            "shellCount": shells,
            "boundaryEdges": boundary,
            "nonManifoldEdges": nonmanifold,
            "badEdges": bad,
            "watertight": bad == 0,
        },
        "risks": {
            "openMesh": bad > 0,
            "groupedModels": max(0, shells - 1),
            "thinWalls": thin,
            "overhangFaces": overhang,
            "bridgeFaces": bridges,
        },
        "riskClasses": risk_classes[:200000],
    }


def build_prusa_config(machine, process, material, params):
    env = envelope_from_machine(machine)
    build = (machine or {}).get("build") or (process or {}).get("build") or {}
    params = params or {}
    material = material or {}

    quality = params.get("quality")
    quality_options = (((process or {}).get("params") or {}).get("quality") or {}).get("options") or []
    quality_layer_height = next((o.get("layerHeight") for o in quality_options if o.get("value") == quality), None)
    layer_height = number(params.get("layerHeight"), number(quality_layer_height, number((process or {}).get("baseLayerHeight"), 0.2)))
    infill = max(0.0, min(100.0, number(params.get("infill"), 20.0)))
    nozzle = number(build.get("nozzleDiameter"), 0.4)
    filament_diameter = number(build.get("filamentDiameter"), FILAMENT_DIAMETER_MM)
    density = number(material.get("density"), DEFAULT_DENSITY_G_CM3)
    support = 1 if number(build.get("supportFraction"), 0.0) > 0 else 0

    lines = {
        "bed_shape": f"0x0,{env['x']:.3f}x0,{env['x']:.3f}x{env['y']:.3f},0x{env['y']:.3f}",
        "max_print_height": f"{env['z']:.3f}",
        "nozzle_diameter": f"{nozzle:.3f}",
        "filament_diameter": f"{filament_diameter:.3f}",
        "filament_density": f"{density:.4f}",
        "layer_height": f"{layer_height:.3f}",
        "first_layer_height": f"{layer_height:.3f}",
        "fill_density": f"{infill:.0f}%",
        "perimeters": "3",
        "top_solid_layers": "4",
        "bottom_solid_layers": "4",
        "support_material": str(support),
        "support_material_auto": str(support),
        "temperature": "215",
        "first_layer_temperature": "215",
        "bed_temperature": "60",
        "first_layer_bed_temperature": "60",
        "complete_objects": "0",
        "dont_support_bridges": "1",
        "gcode_flavor": "reprap",
    }
    return "\n".join(f"{key} = {value}" for key, value in lines.items()) + "\n"


def parse_duration_seconds(text):
    text = str(text or "").strip().lower()
    if not text:
        return None
    total = 0.0
    matched = False
    for value, unit in re.findall(r"(\d+(?:\.\d+)?)\s*(d|day|days|h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)", text):
        matched = True
        n = float(value)
        if unit.startswith("d"):
            total += n * 86400
        elif unit.startswith("h"):
            total += n * 3600
        elif unit.startswith("m"):
            total += n * 60
        else:
            total += n
    return total if matched and total > 0 else None


def parse_gcode_stats(gcode, density=DEFAULT_DENSITY_G_CM3):
    text = str(gcode or "")
    time_sec = None
    grams = None

    for line in text.splitlines():
        low = line.lower()
        if "estimated printing time" in low and "=" in line:
            parsed = parse_duration_seconds(line.split("=", 1)[1])
            if parsed:
                time_sec = parsed
        if "filament used" in low and "[g]" in low and "=" in line:
            nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", line.split("=", 1)[1])]
            if nums:
                grams = sum(n for n in nums if n > 0)

    fallback = parse_gcode_moves(text, density)
    parsed_grams = grams if grams is not None else fallback["gramsModel"]
    return {
        "timeSec": time_sec or fallback["timeSec"],
        "gramsModel": parsed_grams if parsed_grams > 0 else None,
        "gramsSupport": 0.0,
    }


def parse_gcode_moves(gcode, density=DEFAULT_DENSITY_G_CM3):
    x = y = z = e = 0.0
    feed = 1800.0
    absolute_xyz = True
    absolute_e = True
    motion_sec = 0.0
    extrusion_mm = 0.0

    for raw in str(gcode or "").splitlines():
        line = raw.split(";", 1)[0].strip()
        if not line:
            continue
        if line == "G90":
            absolute_xyz = True
            continue
        if line == "G91":
            absolute_xyz = False
            continue
        if line == "M82":
            absolute_e = True
            continue
        if line == "M83":
            absolute_e = False
            continue
        if not re.match(r"^G0?1\b", line):
            continue

        nx, ny, nz, ne = x, y, z, e
        for word in re.findall(r"[XYZEF]-?\d*\.?\d+", line, re.I):
            axis = word[0].lower()
            val = float(word[1:])
            if axis == "f":
                feed = max(1.0, val)
            elif axis == "e":
                ne = val if absolute_e else e + val
            elif axis == "x":
                nx = val if absolute_xyz else nx + val
            elif axis == "y":
                ny = val if absolute_xyz else ny + val
            elif axis == "z":
                nz = val if absolute_xyz else nz + val

        dist = math.dist((x, y, z), (nx, ny, nz))
        if dist > 0:
            motion_sec += (dist / feed) * 60
        if ne - e > 0:
            extrusion_mm += ne - e
        x, y, z, e = nx, ny, nz, ne

    area = math.pi * (FILAMENT_DIAMETER_MM / 2) ** 2
    grams = (extrusion_mm * area / 1000) * density
    return {"timeSec": motion_sec, "gramsModel": grams}


def prusa_version():
    exe = shutil.which("prusa-slicer")
    if not exe:
        return None
    try:
        res = subprocess.run([exe, "--version"], text=True, capture_output=True, timeout=5, check=False)
        text = (res.stdout or res.stderr or "").strip()
        return text.splitlines()[0] if text else None
    except Exception:
        return None


def _run_prusa(stl_bytes, config_text, material, tmp_path, label, timeout_sec):
    safe_label = re.sub(r"[^a-z0-9_-]+", "-", label.lower()).strip("-") or "trial"
    stl_path = tmp_path / f"input-{safe_label}.stl"
    ini_path = tmp_path / f"config-{safe_label}.ini"
    gcode_path = tmp_path / f"output-{safe_label}.gcode"
    stl_path.write_bytes(stl_bytes)
    ini_path.write_text(config_text, encoding="utf-8")

    cmd = [
        "xvfb-run",
        "-a",
        "prusa-slicer",
        "--load",
        str(ini_path),
        "--export-gcode",
        "--output",
        str(gcode_path),
        str(stl_path),
    ]
    try:
        res = subprocess.run(cmd, text=True, capture_output=True, timeout=timeout_sec, check=False)
    except subprocess.TimeoutExpired as exc:
        raise SliceError("timeout") from exc
    except FileNotFoundError as exc:
        raise SliceError("prusa-slicer is not installed") from exc

    if res.returncode != 0:
        msg = (res.stderr or res.stdout or "PrusaSlicer failed").strip().splitlines()
        raise SliceError(msg[-1] if msg else "PrusaSlicer failed")
    if not gcode_path.exists():
        raise SliceError("PrusaSlicer produced no G-code")

    stats = parse_gcode_stats(gcode_path.read_text(encoding="utf-8", errors="ignore"), number((material or {}).get("density"), DEFAULT_DENSITY_G_CM3))
    if not stats["timeSec"] or stats["timeSec"] <= 0:
        raise SliceError("PrusaSlicer produced empty time estimate")
    return stats


def score_trial(trial, envelope):
    mesh = trial.get("mesh") or {}
    bbox = mesh.get("bbox") or {}
    analysis = trial.get("analysis") or {}
    props = analysis.get("properties") or {}
    risks = analysis.get("risks") or {}
    quality = analysis.get("quality") or {}
    time_sec = trial.get("timeSec") or 0
    height = bbox.get("z") or 0
    bed_area = max(1.0, (bbox.get("x") or 0) * (bbox.get("y") or 0))
    env_area = max(1.0, envelope["x"] * envelope["y"])
    tri_count = max(1, props.get("triCount") or 1)
    contact_area = max(0.0, props.get("bedContactArea_mm2") or 0.0)
    contact_ratio = min(1.0, contact_area / bed_area)
    longest_xy = max(1.0, bbox.get("x") or 0, bbox.get("y") or 0)
    upright_bonus = -10 if height / longest_xy > 1.8 and 0.002 < contact_ratio < 0.35 else 0
    overhang_density = min(1.0, (risks.get("overhangFaces") or 0) / tri_count)
    bridge_density = min(1.0, (risks.get("bridgeFaces") or 0) / tri_count)
    thin_density = min(1.0, (risks.get("thinWalls") or 0) / tri_count)
    score = (
        (time_sec / 60) * 0.55
        + (trial.get("gramsSupport") or 0) * 4.0
        + height * 0.04
        - min(18, (bed_area / env_area) * 18)
        - contact_ratio * 35
        + overhang_density * 14
        + bridge_density * 12
        + thin_density * 10
        + min(16, (quality.get("badEdges") or 0) * 0.004)
        + (risks.get("groupedModels") or 0) * 5
        + upright_bonus
    )
    return {
        "value": score,
        "terms": {
            "timeMin": time_sec / 60,
            "heightMm": height,
            "bedAreaMm2": bed_area,
            "bedContactAreaMm2": contact_area,
            "bedContactRatio": contact_ratio,
            "supportGrams": trial.get("gramsSupport") or 0,
            "overhangFaces": risks.get("overhangFaces") or 0,
            "bridgeFaces": risks.get("bridgeFaces") or 0,
            "thinWalls": risks.get("thinWalls") or 0,
            "badEdges": quality.get("badEdges") or 0,
            "uprightBonus": upright_bonus,
        },
    }


def slice_with_prusa(stl_bytes, machine, process, material, params, timeout_sec=180, progress_cb=None):
    env = envelope_from_machine(machine)
    params = params or {}
    optimize = params.get("optimizeOrientation", True) is not False
    def progress(**payload):
        if progress_cb:
            progress_cb(payload)

    progress(state="analyzing", progress=0.08, stage="Analyzing mesh")
    candidates = orientation_candidates(stl_bytes, env, optimize=optimize, max_candidates=int(params.get("maxOrientationCandidates") or 6))
    runnable = [c for c in candidates if not c.get("error")]
    total_trials = max(1, len(runnable))
    progress(state="analyzing", progress=0.16, stage="Generated orientation candidates", currentTrial=0, totalTrials=total_trials)
    config_text = build_prusa_config(machine, process, material, params)
    deadline = time.monotonic() + max(1, timeout_sec)
    trials = []
    trial_index = 0

    with tempfile.TemporaryDirectory(prefix="ff-prusa-") as tmp:
        tmp_path = Path(tmp)
        for candidate in candidates:
            if candidate.get("error"):
                trials.append({
                    "name": candidate["name"],
                    "label": candidate["label"],
                    "error": candidate["error"],
                })
                continue
            trial_index += 1
            progress(
                state="slicing",
                progress=0.18 + 0.68 * ((trial_index - 1) / total_trials),
                stage=f"Slicing orientation {trial_index}/{total_trials}",
                currentTrial=trial_index,
                totalTrials=total_trials,
            )
            remaining = max(1, int(deadline - time.monotonic()))
            if remaining <= 1:
                trials.append({
                    "name": candidate["name"],
                    "label": candidate["label"],
                    "error": "timeout",
                })
                continue
            try:
                stats = _run_prusa(candidate["stl"], config_text, material, tmp_path, candidate["name"], remaining)
                analysis = analyze_binary_stl(candidate["stl"])
                score = score_trial({ **stats, "mesh": candidate["mesh"], "analysis": analysis }, env)
                trials.append({
                    "name": candidate["name"],
                    "label": candidate["label"],
                    "reason": candidate.get("reason"),
                    **stats,
                    "mesh": candidate["mesh"],
                    "analysis": analysis,
                    "orientationScore": score,
                })
                progress(
                    state="slicing",
                    progress=0.18 + 0.68 * (trial_index / total_trials),
                    stage=f"Finished orientation {trial_index}/{total_trials}",
                    currentTrial=trial_index,
                    totalTrials=total_trials,
                )
            except SliceError as exc:
                trials.append({
                    "name": candidate["name"],
                    "label": candidate["label"],
                    "reason": candidate.get("reason"),
                    "error": str(exc),
                    "mesh": candidate.get("mesh"),
                })

    successful = [t for t in trials if t.get("timeSec")]
    if not successful:
        first_error = next((t.get("error") for t in trials if t.get("error")), None)
        raise SliceError(first_error or "PrusaSlicer failed all orientation trials")

    progress(state="scoring", progress=0.9, stage="Scoring orientations", currentTrial=total_trials, totalTrials=total_trials)
    selected = min(successful, key=lambda t: (t.get("orientationScore") or {}).get("value", float("inf")))
    public_trials = []
    for trial in trials:
        public_trials.append({
            "name": trial.get("name"),
            "label": trial.get("label"),
            "reason": trial.get("reason"),
            "timeSec": trial.get("timeSec"),
            "gramsModel": trial.get("gramsModel"),
            "gramsSupport": trial.get("gramsSupport"),
            "error": trial.get("error"),
            "mesh": trial.get("mesh"),
            "orientationScore": trial.get("orientationScore"),
            "analysis": trial.get("analysis"),
            "selected": trial is selected,
        })

    progress(state="scoring", progress=0.96, stage="Finalizing quote", currentTrial=total_trials, totalTrials=total_trials)
    return {
        "ok": True,
        "source": "sliced",
        "slicer": "prusaslicer",
        "timeSec": selected["timeSec"],
        "gramsModel": selected.get("gramsModel"),
        "gramsSupport": selected.get("gramsSupport") or 0.0,
        "warnings": [],
        "mesh": selected.get("mesh"),
        "analysis": selected.get("analysis"),
        "orientationScore": selected.get("orientationScore"),
        "selectedOrientation": {
            "name": selected.get("name"),
            "label": selected.get("label"),
            "reason": selected.get("reason"),
        },
        "trials": public_trials,
    }
