FROM ubuntu:24.04

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    python3-pip \
    python3-venv \
    prusa-slicer \
    xvfb \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PATH="/opt/venv/bin:${PATH}"
ENV PORT=8080
ENV CORS_ORIGIN=*
ENV MAX_UPLOAD_MB=50
ENV SLICE_TIMEOUT_SEC=180

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]

