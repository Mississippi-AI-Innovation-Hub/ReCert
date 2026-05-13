#Bridge to json file
import json
from datetime import datetime, timedelta, timezone
from scripts.config import(
     INVENTORY_FILE, 
     LOGS_FILE, 
     DISPLAY_LOGS_FILE,
     CA_REQUESTS_FILE, 
     SIMULATION_STATE_FILE, 
     DAYS_PER_RUN,
     RENEWAL_HISTORY_FILE,
     SIMULATED_CA_RESULTS_FILE
)

def load_certificates():
    #Load all certificates from the json file
    try:
        with open(INVENTORY_FILE, "r", encoding = "utf-8") as file:
            return json.load(file)
    except:
        return []
    
def save_certificates(certificates):
    #Write the updated list back to the JSON file
    with open(INVENTORY_FILE, "w", encoding = "utf-8") as file:
        json.dump(certificates, file, indent = 2)

def update_certificate(cert_id, updates):
    certificates = load_certificates()

    for cert in certificates:
        if cert["certificate_id"] == cert_id:
            cert.update(updates)
            break

    save_certificates(certificates)

def load_logs():
    try:
        with open(LOGS_FILE, "r", encoding = "utf-8") as file:
            return json.load(file)
    except:
        return []

def save_logs(logs):
    with open(LOGS_FILE, "w", encoding = "utf-8") as file:
        json.dump(logs, file, indent = 2)

def append_log(cert_id, domain, step, level, message):
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "certificate_id": cert_id,
        "domain": domain,
        "step": step,
        "level": level,
        "message": message
    }
    logs = load_logs()
    logs.append(log_entry)
    save_logs(logs)

def load_ca_requests():
    try:
        with open(CA_REQUESTS_FILE, "r", encoding = "utf-8") as file:
            return json.load(file)
    except:
        return []
    
def save_ca_requests(requests):
    with open(CA_REQUESTS_FILE, "w", encoding = "utf-8") as file:
        json.dump(requests, file, indent = 2)

def append_ca_request(request):
    requests = load_ca_requests()
    requests.append(request)
    save_ca_requests(requests)

def load_simulation_state():
    try:
        with open(SIMULATION_STATE_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except:
        return{
            "current_date": "2026-04-25",
            "current_cycle": 0
        }

def save_simulation_state(state):
    with open(SIMULATION_STATE_FILE, "w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)

def get_simulated_today():
    state = load_simulation_state()
    return datetime.fromisoformat(state["current_date"]).date()

def advance_simulation_day():
    state = load_simulation_state()

    current_date = datetime.fromisoformat(state["current_date"]).date()
    new_date = current_date + timedelta(days=DAYS_PER_RUN)

    state["current_date"] = new_date.isoformat()
    state["current_cycle"] = state.get("current_cycle", 0) + 1

    save_simulation_state(state)

def load_display_logs():
    try:
        with open(DISPLAY_LOGS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except:
        return []
    
def save_display_logs(logs):
    with open(DISPLAY_LOGS_FILE, "w", encoding="utf-8") as file:
        json.dump(logs, file, indent=2)

def append_display_log(cert_id, domain, step, level, message):
    log_entry = {
        "timestamp": get_simulated_today().isoformat(),
        "certificate_id": cert_id,
        "domain": domain,
        "step": step,
        "level": level,
        "message": message
    }

    logs = load_display_logs()
    logs.append(log_entry)

    logs = logs[-40:]

    save_display_logs(logs)


def load_renewal_history():
    try:
        with open(RENEWAL_HISTORY_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except:
        return []
    
def save_renewal_history(history):
    with open(RENEWAL_HISTORY_FILE, "w", encoding="utf-8") as file:
        return json.dump(history, file, indent=2)
    
def append_renewal_history(record):
    history = load_renewal_history()
    history.append(record)
    save_renewal_history(history)


def load_simulated_ca_results():
    try:
        with open(SIMULATED_CA_RESULTS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except:
        return []

def save_simulated_ca_results(results):
    with open(SIMULATED_CA_RESULTS_FILE, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=2)