"""
Main Orchestrator

This file runs the daily certificate renewal workflow. It loads the certificate inventory,
executes each step of the renewal process in order (eligibility check, CSR generation,
external CA response handling, installation, and validation), and then saves the updated state.

This acts as the central entry point for the automation system and is intended to be run
once per scheduled cycle (e.g., daily).
"""

from scripts.workers.eligibility_checker import check_eligibility
from scripts.workers.csr_generator import generate_csr
from scripts.workers.ca_response_checker import check_ca_responses
from scripts.external.fake_ca import run_fake_ca
from scripts.json_store import advance_simulation_day, load_simulation_state
from scripts.workers.install_worker import install_certificates
from scripts.workers.validation_worker import validate_certificates


def process_certificates():
    state = load_simulation_state()
    print(f"Running simulated day {state['current_cycle']} - {state['current_date']}")

    check_eligibility()
    print("Eligibilty check complete")

    generate_csr()
    print("CSR Generated and Sent")

    run_fake_ca()

    check_ca_responses()

    install_certificates()

    validate_certificates()

    advance_simulation_day()
    new_state = load_simulation_state()
    print(f"Daily workflow complete. Next simulated date: {new_state['current_date']}")


if __name__ == "__main__":
    process_certificates()
    