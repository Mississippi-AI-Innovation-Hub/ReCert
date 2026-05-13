import json
import random
from datetime import date, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
INVENTORY_FILE = BASE_DIR / "backend" / "inventory.json"

START_DATE = date.fromisoformat("2026-04-25")

certificates = []

# Create shuffled list of days between 30 and 90
days_range = list(range(30, 91))
random.shuffle(days_range)

for i in range(1, 10):
    # Pick random day (cycle if needed)
    days_left = days_range[i % len(days_range)]

    expiration_date = START_DATE + timedelta(days=days_left)
    last_renewed = expiration_date - timedelta(days=90)

    certificates.append({
        "certificate_id": f"{i:04}",
        "domain": f"mda{i}.gov",
        "expiration_date": expiration_date.isoformat(),
        "status": "ACTIVE",
        "last_renewed": last_renewed.isoformat(),
    })

with open(INVENTORY_FILE, "w", encoding="utf-8") as file:
    json.dump(certificates, file, indent=2)

print("Randomized inventory created.")