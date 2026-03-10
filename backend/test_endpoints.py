import requests

def show_detailed_headcount():
    try:
        active = requests.get("http://127.0.0.1:8000/active-persons").json()
        live = requests.get("http://127.0.0.1:8000/live-headcount").json()
        
        print(f"--- LIVE HEADCOUNT API ---")
        print(f"Total:   {live.get('total_persons')}")
        print(f"Known:   {live.get('known_persons')}")
        print(f"Unknown: {live.get('unknown_persons')}")
        print("\n--- ACTIVE INDIVIDUALS REGISTRY ---")
        
        known_count = 0
        unknown_count = 0
        
        for person in active:
            if person.get('is_unknown'):
                unknown_count += 1
                status = "UNKNOWN"
            else:
                known_count += 1
                status = "KNOWN"
                
            print(f"[{status}] ID: {person.get('identity')} | Track: {person.get('track_id')}")

        print(f"\n[Verification] Parsed {known_count} known and {unknown_count} unknown.")
        print(f"[Verification] Math Match: {known_count == live.get('known_persons') and unknown_count == live.get('unknown_persons')}")
        
    except Exception as e:
        print("Error pulling data:", e)

if __name__ == "__main__":
    show_detailed_headcount()
