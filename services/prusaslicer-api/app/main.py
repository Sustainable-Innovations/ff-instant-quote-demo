import json
import os
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .slicer import SliceError, prusa_version, slice_with_prusa


MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "50"))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
SLICE_TIMEOUT_SEC = int(os.getenv("SLICE_TIMEOUT_SEC", "180"))
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")
MAX_SLICE_WORKERS = int(os.getenv("MAX_SLICE_WORKERS", "1"))
JOB_TTL_SEC = int(os.getenv("JOB_TTL_SEC", "900"))
MAX_QUEUE_JOBS = int(os.getenv("MAX_QUEUE_JOBS", "4"))
QUEUE_TIMEOUT_SEC = int(os.getenv("QUEUE_TIMEOUT_SEC", "120"))


app = FastAPI(title="FlexFactory PrusaSlicer API", version="1.0.0")
executor = ThreadPoolExecutor(max_workers=max(1, MAX_SLICE_WORKERS))
jobs = {}
jobs_lock = threading.Lock()

origins = ["*"] if CORS_ORIGIN.strip() == "*" else [o.strip() for o in CORS_ORIGIN.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def parse_json_field(raw, name):
    try:
        return json.loads(raw) if raw else {}
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"{name} must be valid JSON") from exc


def cleanup_jobs():
    now = time.time()
    with jobs_lock:
        for job in jobs.values():
            if job.get("state") == "queued" and now - job.get("createdAt", now) > QUEUE_TIMEOUT_SEC:
                job.update({
                    "state": "failed",
                    "progress": 1.0,
                    "stage": "Manual review required",
                    "error": "slicer queue timeout",
                    "updatedAt": now,
                })
        expired = [
            job_id for job_id, job in jobs.items()
            if now - job.get("updatedAt", job.get("createdAt", now)) > JOB_TTL_SEC
        ]
        for job_id in expired:
            jobs.pop(job_id, None)


def public_job(job_id, job):
    elapsed = max(0, time.time() - job["createdAt"])
    progress = float(job.get("progress") or 0)
    eta = None
    if 0.02 < progress < 0.99:
        eta = max(0, int(elapsed * (1 - progress) / progress))
    return {
        "jobId": job_id,
        "state": job.get("state", "queued"),
        "progress": min(1.0, max(0.0, progress)),
        "stage": job.get("stage", "Queued"),
        "elapsedSec": int(elapsed),
        "etaSec": eta,
        "createdAt": job.get("createdAt"),
        "startedAt": job.get("startedAt"),
        "updatedAt": job.get("updatedAt"),
        "uploadBytes": job.get("uploadBytes"),
        "currentTrial": job.get("currentTrial"),
        "totalTrials": job.get("totalTrials"),
        "result": job.get("result"),
        "error": job.get("error"),
    }


def set_job(job_id, **updates):
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            return
        job.update(updates)
        job["updatedAt"] = time.time()


def run_slice_job(job_id, payload):
    with jobs_lock:
        job = jobs.get(job_id)
        if not job or job.get("state") == "failed":
            return
    set_job(job_id, state="analyzing", progress=0.04, stage="Preparing mesh", startedAt=time.time())

    def progress_cb(update):
        set_job(
            job_id,
            state=update.get("state", "slicing"),
            progress=update.get("progress", 0),
            stage=update.get("stage", "Slicing"),
            currentTrial=update.get("currentTrial"),
            totalTrials=update.get("totalTrials"),
        )

    try:
        result = slice_with_prusa(
            payload["data"],
            payload["machine"],
            payload["process"],
            payload["material"],
            payload["params"],
            timeout_sec=SLICE_TIMEOUT_SEC,
            progress_cb=progress_cb,
        )
        set_job(job_id, state="succeeded", progress=1.0, stage="Quote ready", result=result, error=None)
    except Exception as exc:
        set_job(job_id, state="failed", progress=1.0, stage="Manual review required", error=str(exc))


@app.get("/health")
def health():
    cleanup_jobs()
    version = prusa_version()
    with jobs_lock:
        queued = sum(1 for job in jobs.values() if job.get("state") == "queued")
        active = sum(1 for job in jobs.values() if job.get("state") in {"analyzing", "slicing", "scoring"})
        oldest_queued_age = max(
            [time.time() - job.get("createdAt", time.time()) for job in jobs.values() if job.get("state") == "queued"] or [0]
        )
    return {
        "ok": version is not None,
        "slicer": "prusaslicer",
        "version": version,
        "queue": {
            "maxWorkers": max(1, MAX_SLICE_WORKERS),
            "maxQueueJobs": MAX_QUEUE_JOBS,
            "queued": queued,
            "active": active,
            "oldestQueuedSec": int(oldest_queued_age),
        },
    }


@app.post("/slice-jobs")
async def create_slice_job(
    file: UploadFile = File(...),
    machine: str = Form("{}"),
    process: str = Form("{}"),
    material: str = Form("{}"),
    params: str = Form("{}"),
):
    cleanup_jobs()
    name = (file.filename or "").lower()
    if name and not name.endswith(".stl"):
        raise HTTPException(status_code=400, detail="only STL uploads are supported")

    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"upload exceeds {MAX_UPLOAD_MB} MB limit")

    with jobs_lock:
        queued_or_active = sum(1 for job in jobs.values() if job.get("state") in {"queued", "analyzing", "slicing", "scoring"})
    if queued_or_active >= MAX_QUEUE_JOBS:
        raise HTTPException(status_code=429, detail="slicer busy; try again shortly")

    job_id = uuid.uuid4().hex
    payload = {
        "data": data,
        "machine": parse_json_field(machine, "machine"),
        "process": parse_json_field(process, "process"),
        "material": parse_json_field(material, "material"),
        "params": parse_json_field(params, "params"),
    }
    now = time.time()
    with jobs_lock:
        jobs[job_id] = {
            "state": "queued",
            "progress": 0.01,
            "stage": "Queued",
            "createdAt": now,
            "updatedAt": now,
            "uploadBytes": len(data),
            "currentTrial": 0,
            "totalTrials": None,
            "result": None,
            "error": None,
        }
    executor.submit(run_slice_job, job_id, payload)
    return { "jobId": job_id, "statusUrl": f"/slice-jobs/{job_id}" }


@app.get("/slice-jobs/{job_id}")
def get_slice_job(job_id: str):
    cleanup_jobs()
    with jobs_lock:
        job = jobs.get(job_id)
        if not job:
            return {
                "jobId": job_id,
                "state": "expired",
                "progress": 1.0,
                "stage": "Job expired",
                "elapsedSec": 0,
                "etaSec": None,
                "currentTrial": None,
                "totalTrials": None,
                "result": None,
                "error": "Job not found or expired",
            }
        return public_job(job_id, job)


@app.post("/slice")
async def slice_endpoint(
    file: UploadFile = File(...),
    machine: str = Form("{}"),
    process: str = Form("{}"),
    material: str = Form("{}"),
    params: str = Form("{}"),
):
    name = (file.filename or "").lower()
    if name and not name.endswith(".stl"):
        raise HTTPException(status_code=400, detail="only STL uploads are supported")

    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"upload exceeds {MAX_UPLOAD_MB} MB limit")

    try:
        return slice_with_prusa(
            data,
            parse_json_field(machine, "machine"),
            parse_json_field(process, "process"),
            parse_json_field(material, "material"),
            parse_json_field(params, "params"),
            timeout_sec=SLICE_TIMEOUT_SEC,
        )
    except SliceError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
