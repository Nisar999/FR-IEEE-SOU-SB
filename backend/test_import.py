import sys
import traceback

try:
    import app.main
    print("SUCCESS: app.main imported successfully.")
except Exception as e:
    print("ERROR LOADING APP MAIN:")
    traceback.print_exc()
