import requests
import io
import sys

try:
    r = requests.get("http://127.0.0.1:8000/debug-frame")
    if r.status_code == 200:
        with open("debug_frame.jpg", "wb") as f:
            f.write(r.content)
        print("Frame downloaded successfully.")
    else:
        print(f"Error: {r.status_code} - {r.text}")
except Exception as e:
    print(f"Failed: {e}")
