🏎️ F1 Real-Time Telemetry & Anomaly Detection

A production-grade, event-driven architecture designed to monitor Formula 1 telemetry data in real-time. This system uses machine learning to detect mechanical failures or sensor anomalies and provides a high-fidelity, dual-theme dashboard for mission-critical monitoring.
🏗️ System Architecture

The system is fully containerized and consists of three decoupled microservices:

    Producer: A high-frequency Python script that simulates/intercepts F1 telemetry data.

    Engine (FastAPI): A high-performance backend that runs an Isolation Forest ML model to detect anomalies in real-time and broadcasts alerts via WebSockets.

    Persistence (MongoDB): Stores critical failure logs to ensure data survival across sessions.

    Dashboard (Next.js + Tailwind): A professional-grade UI featuring real-time charting, persistent anomaly history, and theme-aware styling.

🚀 Key Features

    Real-Time AI: Live anomaly detection using Scikit-Learn's Isolation Forest.

    Persistence Layer: Historical anomaly tracking backed by MongoDB.

    Microservice Orchestration: Fully containerized via Docker Compose.

    Professional UI: Modern, futuristic dashboard with dark/light mode toggle and responsive data visualization.

🛠️ Quick Start
Prerequisites

    Docker Desktop installed and running.

Installation

    Clone the repository:
    Bash

    git clone https://github.com/your-username/f1-telemetry-engine.git
    cd f1-telemetry-engine

    Spin up the entire infrastructure:
    Bash

    docker compose up --build

    Access the dashboard:
    Open http://localhost:3000 in your browser.

    Run the telemetry simulator:
    Bash

    python backend/producer.py

⚙️ Tech Stack

    Frontend: Next.js, Recharts, Tailwind CSS, Lucide Icons.

    Backend: FastAPI, Motor (Async MongoDB Driver).

    AI/ML: Scikit-Learn (Isolation Forest), Pandas.

    Infrastructure: Docker, Docker Compose, MongoDB.

📈 Roadmap

    [ ] Integration with official F1 Live Timing API.

    [ ] Automated Slack/Discord webhooks for critical engine alerts.

    [ ] Deployment to cloud provider (Render/Railway)
