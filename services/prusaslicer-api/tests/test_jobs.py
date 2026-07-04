import sys
import time
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient

import app.main as main
from test_slicer import cube_stl


class SliceJobTests(unittest.TestCase):
    def setUp(self):
        with main.jobs_lock:
            main.jobs.clear()

    def test_slice_job_lifecycle_success(self):
        def fake_slice(data, machine, process, material, params, timeout_sec=180, progress_cb=None):
            progress_cb({"state": "analyzing", "progress": 0.2, "stage": "Analyzing mesh", "currentTrial": 0, "totalTrials": 2})
            progress_cb({"state": "slicing", "progress": 0.55, "stage": "Slicing orientation 1/2", "currentTrial": 1, "totalTrials": 2})
            return {
                "ok": True,
                "source": "sliced",
                "slicer": "prusaslicer",
                "timeSec": 120,
                "gramsModel": 3.4,
                "gramsSupport": 0,
                "selectedOrientation": {"name": "original", "label": "Original orientation"},
                "trials": [],
                "analysis": {"quality": {"badEdges": 0}, "risks": {}},
            }

        client = TestClient(main.app)
        with patch("app.main.slice_with_prusa", side_effect=fake_slice):
            res = client.post(
                "/slice-jobs",
                files={"file": ("cube.stl", cube_stl(10), "model/stl")},
                data={"machine": "{}", "process": "{}", "material": "{}", "params": "{}"},
            )
            self.assertEqual(res.status_code, 200)
            job_id = res.json()["jobId"]
            states = []
            for _ in range(20):
                status = client.get(f"/slice-jobs/{job_id}").json()
                states.append((status["state"], status["progress"]))
                if status["state"] == "succeeded":
                    break
                time.sleep(0.05)

        self.assertEqual(status["state"], "succeeded")
        self.assertEqual(status["progress"], 1.0)
        self.assertEqual(status["result"]["timeSec"], 120)
        self.assertTrue(all(states[i][1] <= states[i + 1][1] for i in range(len(states) - 1)))

    def test_slice_job_expired_response(self):
        client = TestClient(main.app)
        status = client.get("/slice-jobs/missing").json()
        self.assertEqual(status["state"], "expired")
        self.assertEqual(status["progress"], 1.0)


if __name__ == "__main__":
    unittest.main()

