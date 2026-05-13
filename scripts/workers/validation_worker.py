"""
Certificate Validation Worker

This worker validates certificates after internal installation.

If validation succeeds, the certificate is returned to ACTIVE status with a new

expiration date. If validation fails, the certificate is marked FAILED so the

team can investigate or later roll back using the backup certificate
"""

from datetime import timedelta

from scripts.config import CERTIFICATE_LIFETIME
from scripts.json_store import (
    load_certificates,
    save_certificates,
    append_log,
    append_display_log,
    append_renewal_history,
    get_simulated_today
)

def validate_certificates():
    certificates = load_certificates()
    today = get_simulated_today()

    for cert in certificates:
        if cert.get("status") != "READY_FOR_VALIDATION":
            continue

        cert_id = cert["certificate_id"]
        domain = cert["domain"]

        installed_path = cert.get("installed_certificate_path")

        if not installed_path:
            cert["status"] = "FAILED"
            cert["failure_reason"] = "MISSING_INSTALLED_CERTIFICATE"

            append_log(
                cert_id,
                domain,
                "VALIDATION",
                "ERROR",
                "Validation failed because no installed certificate path was found"
            )
            continue

        old_expiration_date = cert.get("expiration_date")
        new_expiration_date = today + timedelta(days=CERTIFICATE_LIFETIME)

        cert["status"] = "ACTIVE"
        cert["expiration_date"] = new_expiration_date.isoformat()
        cert["last_renewed"] = today.isoformat()
        cert["external_process"] = None
        cert["external_request_id"] = None
        cert["failure_reason"] = None
        cert["retry_reason"] = None
        cert["validated_at"] = today.isoformat()

        cert["installed_certificate_path"] = None
        cert["installed_at"] = None
        cert["issued_certificate_path"] = None
        cert["failure_message"] = None

        append_renewal_history({
            "certificate_id": cert_id,
            "domain": domain,
            "renewed_at": today.isoformat(),
            "old_expiration_date": old_expiration_date,
            "new_expiration_date": new_expiration_date.isoformat(),
            "result": "SUCCESS"
        })

        append_log(
                cert_id,
                domain,
                "VALIDATION",
                "INFO",
                f"Certificate validated successfully. Status changed to ACTIVE. New expiry: {new_expiration_date.isoformat()}"
            )
        append_display_log(
                cert_id,
                domain,
                "VALIDATION",
                "INFO",
                f"{domain} renewed successfully. New expiriration date: {new_expiration_date.isoformat()}"
            )
    save_certificates(certificates)