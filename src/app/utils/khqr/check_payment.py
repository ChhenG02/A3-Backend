# src/app/utils/khqr/check_payment.py

import sys
import os
from bakong_khqr import KHQR
from dotenv import load_dotenv

load_dotenv()
BAKONG_TOKEN = os.getenv("BAKONG_TOKEN")

khqr = KHQR(BAKONG_TOKEN)

def main():
    try:
        md5 = sys.argv[1]
        status = khqr.check_payment(md5)
        print(status)  # Will print "PAID" or "UNPAID"
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        exit(1)

if __name__ == "__main__":
    main()
