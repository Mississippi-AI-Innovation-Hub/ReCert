#Schedule daily/timely inventory/renewal check

import time
from scripts.main import process_certificates
from scripts.config import SCHEDULE_INTERVAL

def run_scheduler():
  print("Scheduler started...")

  while True:
    print("\nRunning certificate check...")
    process_certificates()

    print(f"\nNext check in {SCHEDULE_INTERVAL} seconds...")
    time.sleep(SCHEDULE_INTERVAL)



if __name__ == "__main__":
    run_scheduler()
