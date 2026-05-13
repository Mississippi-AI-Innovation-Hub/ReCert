from datetime import datetime

from scripts.config import RENEWAL_WINDOW_DAYS
from scripts.json_store import (
    load_certificates, 
    save_certificates, 
    append_log, 
    get_simulated_today
)


def check_eligibility():
    certificates = load_certificates()
    today = get_simulated_today()

    for cert in certificates:
        cert_id = cert["certificate_id"]
        domain =  cert["domain"]
        status = cert.get("status")

        if status != "ACTIVE":
            append_log(
                cert_id,
                domain,
                "ELIGIBILITY_CHECK",
                "INFO",
                f"Skipped eligibility check because status is ({status})"
            )
            continue

        expiration_date =  datetime.fromisoformat(cert["expiration_date"]).date()
        days_left = (expiration_date - today).days 

        if days_left <= RENEWAL_WINDOW_DAYS:
            cert["status"] = "READY_FOR_RENEWAL"

            append_log(
                cert_id,
                domain,
                "ELIGIBILITY_CHECK",
                "INFO",
                f"Certificate eligible for renewal ({days_left} days left)"
            )
        else:
            append_log(
                cert_id,
                domain,
                "ELIGIBILITY_CHECK",
                "INFO",
                f"Certificate is not eligible for renewal yet, ({days_left} days left). Status remains ACTIVE"
            )

    save_certificates(certificates)