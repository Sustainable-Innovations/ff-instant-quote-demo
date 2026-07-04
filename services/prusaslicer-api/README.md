# PrusaSlicer API

Railway-ready native slicing service for the 3D quote demo.

## Local

```powershell
cd services/prusaslicer-api
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\uvicorn app.main:app --reload --port 8787
```

PrusaSlicer must be installed locally for real `/slice` calls. Unit tests do not require it:

```powershell
python -m unittest discover -s tests
```

## Browser

Open the quote page with:

```text
?slicer=prusaslicer&slicerApi=http://127.0.0.1:8787
```

On Railway, use the deployed service URL as `slicerApi`.

