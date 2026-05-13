"""
CA Response Checker

Checks CA results and updates certificates accordingly.

Also increments wait_days and logs escalation if needed
"""

import json

from scripts.config import (
    SIMULATED_CA_RESULTS_FILE,
    DAYS_PER_RUN
)

from scripts.json_store import (
    load_certificates,
    save_certificates,
    load_ca_requests,
    save_ca_requests,
    append_log,
    load_simulated_ca_results,
    save_simulated_ca_results,
    append_display_log
)

    
def check_ca_responses():
    certificates = load_certificates()
    requests = load_ca_requests()
    results = load_simulated_ca_results()

    processed_request_ids = set()
    results_map = {r["request_id"]: r for r in results}

    for cert in certificates:
        if cert.get("status") != "IN_PROGRESS":
            continue

        if cert.get("external_process") != "CA_REQUEST":
            continue

        request_id = cert.get("external_request_id")

        request =  next(
            (r for r in requests if r["request_id"] == request_id), 
            None
            )
        if request is None:
            append_log(
                cert["certificate_id"],
                cert["domain"],
                "CA_CHECK",
                "ERROR",
                f"No CA request found for request id {request_id}."
            )
            continue

        request["wait_days"] = request.get("wait_days", 0) + DAYS_PER_RUN

        result = results_map.get(request_id)

        if result is None:
            append_log(
                cert["certificate_id"],
                cert["domain"],
                "CA_CHECK",
                "INFO",
                f"Waiting for CA response ({request['wait_days']} simulated days)."
            )
            continue

        processed_request_ids.add(request_id)

        if result["status"] == "ISSUED":
            cert["status"] = "READY_FOR_INSTALL"
            cert["external_process"] = None
            cert["external_request_id"] = None

            append_log(
                cert["certificate_id"],
                cert["domain"],
                "CA_CHECK",
                "INFO",
                "Certificate issued by CA. Status changed to READY_TO_INSTALL"
            )
            append_display_log(
                cert["certificate_id"],
                cert["domain"],
                "CA RESPONSE",
                "INFO",
                f"CA has issued the certificate for {cert["domain"]} successfully."
            )
        elif result["status"] == "REJECTED":
            cert["status"] = "ESCALATED"
            cert["failure_reason"] = "CA_REJECTED_CSR"
            cert["failure_message"] = result.get("message", "CA rejected CSR.")
            cert["external_process"] = None
            cert["external_request_id"] = None

            append_log(
                cert["certificate_id"],
                cert["domain"],
                "CA_CHECK",
                "ERROR",
                "CA rejected the CSR. Manual review required. Status changed to ESCALATED"
            )
            append_display_log(
                cert["certificate_id"],
                cert["domain"],
                "CA RESPONSE",
                "INFO",
                f"CA has rejectd the CSR for {cert["domain"]} and could not issue a new certificate."
            )

        elif result["status"] == "FAILED":
            cert["status"] = "READY FOR RENEWAL"
            cert["external_process"] = None
            cert["external_request_id"] = None
            cert["retry_reason"] = "TEMPORARY_CA_FAILURE"
            

            append_log(
                cert["certificate_id"],
                cert["domain"],
                "CA_CHECK",
                "ERROR",
                "CA had a temporary failure. Certificate moved back to READY_FOR_RENEWAL for retry"
            )
            append_display_log(
                cert["certificate_id"],
                cert["domain"],
                "CA RESPONSE",
                "INFO",
                f"The CA had an failure when issuing the certificate for {cert["domain"]}. Renewal will be tried again"
            )

    requests = [
        r for r in requests
        if r["request_id"] not in processed_request_ids
    ]

    results = [
        r for r in results
        if r["request_id"] not in processed_request_ids
    ]

    save_certificates(certificates)
    save_ca_requests(requests)
    save_simulated_ca_results(results)