"""
Fake CA Simulator

Simulates an external Certificate Authority. It reads CA requests and

randomly decides whether to respond with ISSUED, REJECTED, FAILED,

or give no response (delay)
"""

import random

from scripts.json_store import load_ca_requests, get_simulated_today, save_simulated_ca_results, load_simulated_ca_results
from scripts.config import SIMULATED_CA_RESULTS_FILE
import json


    


def run_fake_ca():
    requests = load_ca_requests()
    results = load_simulated_ca_results()
    today = get_simulated_today()


    existing_ids = {r["request_id"] for r in results}

    for request in requests:
        if request["status"] != "WAITING":
            continue

        if request["request_id"] in existing_ids:
            continue

        wait_days = request.get("wait_days", 0)

        if wait_days < 2:
            #CA does not respond for the first two days 
            choice = "NO_RESPONSE"
        
        elif wait_days < 4:
            #Should start expecting a response after second day
            choice = random.choices(
                ["NO_RESPONSE", "ISSUED"],
                weights = [60, 40],
                k = 1
            )[0]
        
        else:
            #After fourth day, a response should have come
            choice =  random.choices(
                ["ISSUED", "REJECTED", "FAILED"],
                weights = [70, 25, 5],
                k = 1
            )[0]

        if choice == "NO_RESPONSE":
            continue

        result = {
            "request_id": request["request_id"],
            "certificate_id": request["certificate_id"],
            "domain": request["domain"],
            "status": choice,
            "message": f"Certificate status from CA: {choice}",
            "timestamp": today.isoformat()
        }

        results.append(result)
    save_simulated_ca_results(results)

if __name__ == "__main__":
    run_fake_ca()
