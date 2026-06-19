from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="F1 Pit Wall Anomaly Detector")
model = joblib.load('isolation_forest.pkl')

# 1. WEBSOCKET MANAGER
# This keeps track of any React dashboards that connect to the server
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# 2. DATA SCHEMA
class TelemetryRow(BaseModel):
    Speed: int
    RPM: int
    Throttle: float
    Brake: bool
    nGear: int

@app.get("/")
async def root():
    return {"message": "Pit Wall Server is Online. Go to /docs to test."}

# 3. THE FRONTEND FEED (WebSockets)
# Your Next.js app will connect to this endpoint to listen for data
@app.websocket("/ws/live-feed")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection open indefinitely
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 4. THE INGESTION FEED (HTTP POST)
# producer.py still sends data here. 
@app.post("/telemetry")
async def analyze_telemetry(data: TelemetryRow):
    df = pd.DataFrame([data.model_dump()])
    
    # Evaluate the data
    prediction = model.predict(df)[0]
    is_anomaly = bool(prediction == -1)
    
    # Create the final payload
    payload = {
        "Speed": data.Speed,
        "RPM": data.RPM,
        "Throttle": data.Throttle,
        "Brake": data.Brake,
        "nGear": data.nGear,
        "anomaly": is_anomaly
    }
    
    # BROADCAST the payload to any connected React dashboards instantly
    await manager.broadcast(payload)
    
    return {"status": "success"}