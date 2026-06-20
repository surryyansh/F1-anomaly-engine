
# 🏎️ F1 Real-Time Telemetry & Anomaly Detection Engine

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

A production-grade, event-driven microservice architecture designed to ingest, analyze, and visualize Formula 1 telemetry data in real-time. 

This engine uses an **Isolation Forest Machine Learning model** to evaluate live telemetry packets (RPM, Speed, Throttle, Brake, Gear) and instantly detect mechanical failures or impossible physical states, broadcasting alerts to a high-performance React dashboard.

## A. System Architecture


The system is fully containerized and decoupled into distinct microservices:

1. **The Producer:** A high-frequency Python script that simulates or intercepts F1 telemetry data and pushes it to the backend.
2. **The AI Engine (FastAPI):** Ingests the data stream, runs the Scikit-Learn ML model to flag anomalies, and broadcasts the results via WebSockets.
3. **The Database (MongoDB):** Persistently logs all critical system failures and anomalies to ensure data survival across browser sessions.
4. **The Pit Wall Dashboard (Next.js):** A modern, theme-aware command center featuring real-time charting and a persistent critical anomaly log.

## B. Key Features

* **Real-Time ML Processing:** Evaluates data and flags anomalies in milliseconds using Scikit-Learn.
* **Live WebSocket Streaming:** Zero-lag data pipeline pushing updates to the frontend without HTTP polling.
* **Persistent History:** Database integration fetches historical anomaly logs the moment the dashboard mounts.
* **Dockerized Infrastructure:** Environment-agnostic deployment utilizing `docker-compose` for isolated, reliable builds.
* **Modern UI/UX:** Cyberpunk-inspired engineering dashboard with Recharts visualizations and a responsive Light/Dark mode toggle.

## C. Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts
* **Backend:** FastAPI, Python, WebSockets, Motor (Async MongoDB Driver)
* **Machine Learning:** Scikit-Learn (Isolation Forest), Pandas, Joblib
* **DevOps & Database:** Docker, Docker Compose, MongoDB

---

## D. How to Run Locally

Because this project is fully containerized, you do not need to manually install Node.js, MongoDB, or complex Python dependencies on your machine. Docker handles the entire environment.

### Prerequisites
* [Git](https://git-scm.com/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running in the background)
* Python 3.x (Only needed to run the local simulation script)

### Step-by-Step Installation

**1. Clone the repository**
```bash
git clone https://github.com/surryyansh/F1-anomaly-engine.git
cd F1-anomaly-engine

```

**2. Spin up the Microservices**
Let Docker build the API, Frontend, and Database containers and network them together.

```bash
docker compose up --build

```

*Note: The first build will take a minute as it downloads the base images.*

**3. Open the Dashboard**
Once the terminal shows the containers are running, open your browser and navigate to:

```text
http://localhost:3000

```

**4. Fire the Telemetry Simulator**
Open a **new terminal window** (leave Docker running in the first one) and execute the producer script to start feeding data to the AI:

```bash
python backend/producer.py

```

*(If you are on Windows and `python` opens the Windows Store, use `py backend/producer.py` instead).*

Watch the dashboard light up!

## E Future Roadmap

* [ ] **Official F1 Live Timing Integration:** Replace the local producer with a SignalR client to intercept real race weekend data using the `fastf1` library.
* [ ] **Webhooks:** Automated Slack/Discord push notifications for critical engine alerts.
* [ ] **Cloud Deployment:** Migrate Docker containers to a managed cloud provider (e.g., Render, AWS, or Railway).
