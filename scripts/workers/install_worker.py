"""
Certificate Installation Worker

This worker handles certificates that are READY_FOR_INSTALL after the CA 

has issued a renewed certificate.

Because installation is controlled internally by our system, this step does not

wait on an external process. It simulates backing up the old certificate,

installing the new certificate, and moving the certificate to READY_FOR_VALIDATION
"""

from scripts.config import CERTS_DIR, BACKUPS_DIR
from scripts.json_store import (
    load_certificates,
    save_certificates,
    append_log,
    get_simulated_today,
)

def install_certificates():
    certificates = load_certificates()
    today = get_simulated_today()

    for cert in certificates:
        if cert.get("status") != "READY_FOR_INSTALL":
            continue    

        cert_id = cert["certificate_id"]
        domain = cert["domain"]

        backup_path = BACKUPS_DIR / f"{domain}_backup_{today.isoformat()}.crt"
        installed_cert_path = CERTS_DIR / f"{domain}.crt"

        #Back up the old certificate
        with open(backup_path, "w", encoding = "utf-8") as file:
            file.write(f"BACKUP CERTIFICTE FOR {domain}\n")
            file.write(f"CERTIFICATE ID: {cert_id}\n")
            file.write(f"BACKUP DATE: {today.isoformat()}\n")

        #Install the new certificate
        with open(installed_cert_path, "w", encoding = "utf-8") as file:
            file.write(f"INSTALLED CERTIFICTE FOR {domain}\n")
            file.write(f"CERTIFICATE ID: {cert_id}\n")
            file.write(f"INSTALLATION DATE: {today.isoformat()}\n")

        cert["status"] = "READY_FOR_VALIDATION"
        cert["installed_certificate_path"] = str(installed_cert_path)
        cert["installed_at"] = today.isoformat()

        append_log(
            cert_id,
            domain,
            "INSTALLATION",
            "INFO",
            "Certificate installed internally. Status changed to READY_FOR_VALIDATION"
        )
    save_certificates(certificates)
