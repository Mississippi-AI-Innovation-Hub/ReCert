"""
Configuration Settings

This file contains all global configuration values used throughout the system, including:
- Renewal window thresholds
- External wait time limits
- Expiration alert levels
- File paths for data storage

Centralizing these values allows easy tuning of system behavior without modifying logic code.
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INVENTORY_FILE = BASE_DIR / "backend" / "inventory.json"
LOGS_FILE = BASE_DIR / "backend" / "cert_logs.json"
ALERTS_FILE = BASE_DIR / "backend" / "alerts.json"
RENEWAL_HISTORY_FILE = BASE_DIR / "backend" / "renewal_history.json"
DISPLAY_LOGS_FILE = BASE_DIR / "backend" / "display_logs.json"

CA_REQUESTS_FILE = BASE_DIR / "backend" / "ca_requests.json"
SIMULATED_CA_RESULTS_FILE = BASE_DIR / "backend" / "simulated_ca_results.json"
SIMULATION_STATE_FILE = BASE_DIR / "backend" / "simulation.json"

ARTIFACTS_DIR = BASE_DIR / "backend" / "artifacts"
CSRS_DIR = ARTIFACTS_DIR / "csrs"
CERTS_DIR = ARTIFACTS_DIR / "certs"
BACKUPS_DIR = ARTIFACTS_DIR / "backups"

RENEWAL_WINDOW_DAYS = 30
CERTIFICATE_LIFETIME = 90
SCHEDULE_INTERVAL = 5

DEMO_START_DATE = "2026-04-25"
DAYS_PER_RUN = 1

HIGH_ALERT_DAYS = 5
CRITICAL_ALERT_DAYS = 3
EMERGENCY_ALERT_DAYS = 1


CSRS_DIR.mkdir(parents=True, exist_ok=True)
CERTS_DIR.mkdir(parents=True, exist_ok=True)
BACKUPS_DIR.mkdir(parents=True, exist_ok=True)