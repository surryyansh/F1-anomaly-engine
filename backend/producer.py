import fastf1
import time
import requests
import os
import random

# 1. Setup caching and load the session
os.makedirs('fastf1_cache', exist_ok=True)
fastf1.Cache.enable_cache('fastf1_cache')

API_URL = "http://127.0.0.1:8000/telemetry"

def stream_telemetry():
    print("Loading simulation data...")
    session = fastf1.get_session(2023, 'Silverstone', 'R')
    session.load(telemetry=True, weather=False, messages=False)

    # Extract Hamilton's fastest lap to act as our live stream
    laps = session.laps.pick_driver('HAM')
    fastest_lap = laps.pick_fastest()
    telemetry = fastest_lap.get_telemetry()
    
    # Convert the pandas dataframe into a list of dictionaries
    stream_data = telemetry[['Speed', 'RPM', 'Throttle', 'Brake', 'nGear']].to_dict(orient='records')
    
    print(f"Beginning live telemetry stream ({len(stream_data)} data points)...")
    print("-" * 50)

    # 2. The 10Hz Streaming Loop
    for row in stream_data:
        # Format the payload to match our FastAPI schema exactly
        payload = {
            "Speed": int(row['Speed']),
            "RPM": int(row['RPM']),
            "Throttle": float(row['Throttle']),
            "Brake": bool(row['Brake']),
            "nGear": int(row['nGear'])
        }
        try:
            # Fire the payload at the FastAPI server
            response = requests.post(API_URL, json=payload)
            result = response.json()
            
            # Print a dashboard-style output to the terminal
            status = "🔴 ANOMALY" if result['anomaly'] else "🟢 NORMAL"
            print(f"[{status}] Speed: {payload['Speed']:>3} km/h | RPM: {payload['RPM']:>5} | Gear: {payload['nGear']}")
            
        except requests.exceptions.ConnectionError:
            print("🚨 Backend offline. Is Uvicorn running?")
            break
            
        # Pause for 100 milliseconds to simulate a 10Hz live feed
        time.sleep(0.1)

if __name__ == "__main__":
    stream_telemetry()