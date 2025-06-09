import sys
import json
import os
from bakong_khqr import KHQR
from dotenv import load_dotenv

import hashlib

# Load environment variables from .env file
load_dotenv()

# Fetch token from env
BAKONG_TOKEN = os.getenv("BAKONG_TOKEN")

# Create KHQR instance
khqr = KHQR(BAKONG_TOKEN)

def main():
    try:
        payload = json.loads(sys.argv[1])
        qr = khqr.create_qr(**payload)
        md5 = hashlib.md5(qr.encode()).hexdigest()

        result = {
            "qr": qr,
            "md5": md5
        }

        print(json.dumps(result))

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        exit(1)

if __name__ == "__main__":
    main()
