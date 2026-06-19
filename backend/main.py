from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import joblib
import pandas as pd

# 1. Initialize the app (No CORS middleware needed!)
app = FastAPI(title="F1 Pit Wall Anomaly Detector")

# 2. Load the ML Model
model = joblib.load('isolation_forest.pkl')

# 3. WebSocket Manager
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

# 4. Data Schema
class TelemetryRow(BaseModel):
    Speed: int
    RPM: int
    Throttle: float
    Brake: bool
    nGear: int

@app.get("/")
async def root():
    return {"message": "Pit Wall Server is Online."}

# 5. WebSocket Route
@app.websocket("/ws/live-feed")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 6. HTTP Route (Producer streams data here)
@app.post("/telemetry")
async def analyze_telemetry(data: TelemetryRow):
    df = pd.DataFrame([data.model_dump()])
    
    prediction = model.predict(df)[0]
    is_anomaly = bool(prediction == -1)
    
    payload = {
        "Speed": data.Speed,
        "RPM": data.RPM,
        "Throttle": data.Throttle,
        "Brake": data.Brake,
        "nGear": data.nGear,
        "anomaly": is_anomaly
    }
    
    
    await manager.broadcast(payload)
    return {"status": "success", "anomaly": is_anomaly}