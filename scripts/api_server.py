import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent


def _read(path: Path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@app.get("/api/inventory")
def get_inventory():
    return _read(BASE_DIR / "backend" / "inventory.json")


@app.get("/api/logs")
def get_logs():
    return _read(BASE_DIR / "backend" / "display_logs.json")

@app.get("/api/renewal-history")
def get_renewal_history():
    return _read(BASE_DIR / "backend" / "renewal_history.json")

@app.get("/api/simulation")
def get_simulation():
    return _read(BASE_DIR / "backend" / "simulation.json")
