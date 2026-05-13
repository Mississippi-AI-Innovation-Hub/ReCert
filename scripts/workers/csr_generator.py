"""
CSR Generator
This Pprogram handles certificates that are READY_FOR_RENEWAL.

It generates a simulated CSR artifact, creates a CA request, and moves
the certificate into IN_PROGRESS while waiting for the external CA
"""

import uuid

from scripts.config import CSRS_DIR
from scripts.json_store import(
    load_certificates,
    save_certificates,
    append_log,
    append_ca_request,
    get_simulated_today,
    append_display_log
)

def generate_csr():
    certificates = load_certificates()
    today = get_simulated_today()

    for cert in certificates:
        cert_id = cert["certificate_id"]
        domain =  cert["domain"]
        status = cert.get("status")  

        if status != "READY_FOR_RENEWAL":
            continue
        
        request_id = f"CA-REQ-{uuid.uuid4().hex[:8]}"

        csr_path = CSRS_DIR / f"{domain}.csr"

        with open(csr_path, "w", encoding = "utf-8") as file:
            file.write(f"SIMULATED CSR FOR {domain}\n")
            file.write(f"CERTIFICATE ID: {cert_id}\n")
            file.write(f"REQUEST ID: {request_id}\n")
            file.write(f"GENERATED AT {today.isoformat()}\n")

        ca_request = {
            "request_id": request_id,
            "certificate_id": cert_id,
            "domain": domain,
            "csr_path": str(csr_path),
            "status": "WAITING",
            "wait_days": 0,
            "submitted_at": today.isoformat()
        }

        append_ca_request(ca_request)

        cert["status"] = "IN_PROGRESS"
        cert["external_process"] = "CA_REQUEST"
        cert["external_request_id"] = request_id

        append_log(
            cert_id,
            domain,
            "CSR_GENERATION",
            "INFO",
            f"Generated CSR and submitted CA request {request_id}."
        )

        append_display_log(
            cert_id,
            domain,
            "CSR_GENERATION",
            "INFO",
            f"CSR generated and sent to CA for {domain}."
        )
    save_certificates(certificates)

