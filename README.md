# PharmaLens 🔬💊

> **Enterprise-Grade Agentic AI Platform for Pharmaceutical Drug Repurposing**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://react.dev/)

## 🎯 Overview

PharmaLens is a cutting-edge Multi-Agent Orchestrator platform that revolutionizes pharmaceutical drug repurposing through AI. By leveraging specialized agents (Clinical, Patent, Market, Vision), PharmaLens analyzes molecules in parallel to identify new therapeutic opportunities.

### Key Features

- **🔒 Hybrid Architecture**: Privacy Toggle to switch between Public Cloud (GPT-4) and Private Local (Llama 3) models
- **🕸️ Knowledge Graph**: Visualizing biological connections using GraphRAG
- **📋 Audit Trails**: Strict server-side logging for compliance (HIPAA-ready)
- **💰 ROI Engine**: Quantitative revenue forecasting for drug candidates

## 🏗️ Architecture

```
PharmaLens/
├── client/          # React + Vite + Tailwind CSS (Frontend) - Port 5173
├── server/          # Node.js + Express (Backend API Gateway) - Port 3001
├── ai_engine/       # Python + FastAPI (Multi-Agent AI System) - Port 8000
└── docker-compose.yml
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org/) |
| **Python** | 3.10+ | [python.org](https://python.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Step 1: Clone the Repository

```bash
git clone https://github.com/ritik0506/PharmaLens.git
cd PharmaLens
```

---

## 📦 Installation (Manual Setup)

> ⚠️ **IMPORTANT**: You need to run **ALL THREE services** (AI Engine, Server, Client) for the application to work properly. Each service runs in its own terminal.

### Step 2: Setup AI Engine (Python FastAPI) - Terminal 1

```bash
# Navigate to ai_engine directory
cd ai_engine

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (CMD):
.\venv\Scripts\activate.bat

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the AI Engine
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Verify**: Open http://localhost:8000/docs to see the Swagger API documentation

### Step 3: Setup Server (Node.js Express) - Terminal 2

Open a **NEW terminal window** and run:

```bash
# Navigate to server directory (from project root)
cd server

# Install dependencies
npm install

# Start the server
npm run dev
```

✅ **Verify**: Open http://localhost:3001/health - you should see:
```json
{"status":"healthy","service":"pharmalens-server"...}
```

### Step 4: Setup Client (React Vite) - Terminal 3

Open a **NEW terminal window** and run:

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

✅ **Verify**: Open http://localhost:5173 to see the PharmaLens dashboard

---

## 🐳 Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- AI Engine: http://localhost:8000/docs

---

## ✅ Verification Checklist

After setup, verify all services are running:

| Service | URL | Expected Response |
|---------|-----|-------------------|
| AI Engine | http://localhost:8000/health | `{"status":"healthy"...}` |
| Backend | http://localhost:3001/health | `{"status":"healthy"...}` |
| Frontend | http://localhost:5173 | PharmaLens Dashboard |

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Module not found" errors in Python
```bash
# Make sure virtual environment is activated
cd ai_engine

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows CMD:
.\venv\Scripts\activate.bat

# macOS/Linux:
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### 2. "ECONNREFUSED" or "Network Error" in frontend
This means the backend server isn't running. Make sure:
- Terminal 2 is running `npm run dev` in the `server` folder
- Check http://localhost:3001/health responds

#### 3. Port already in use
```bash
# Windows - Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# macOS/Linux
lsof -i :3001
kill -9 <PID_NUMBER>
```

#### 4. npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
# Windows:
rmdir /s /q node_modules
del package-lock.json
npm install

# macOS/Linux:
rm -rf node_modules package-lock.json
npm install
```

#### 5. Python version issues
```bash
# Check Python version (must be 3.10+)
python --version

# Use python3 explicitly if needed
python3 -m venv venv
```

#### 6. PowerShell execution policy error (Windows)
```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📡 API Endpoints

### Backend (Node.js - Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research` | Process drug repurposing analysis |
| `GET` | `/api/research/:id` | Get research status |
| `GET` | `/api/research/health` | Health check |
| `GET` | `/health` | Server health |

### AI Engine (Python - Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Multi-agent compound analysis |
| `POST` | `/api/agents/market/roi` | ROI calculation |
| `GET` | `/api/agents/status` | Agent status |
| `GET` | `/health` | Engine health |
| `GET` | `/docs` | Swagger documentation |

---

## 🔐 Privacy Modes

### Cloud Mode (GPT-4)
- Higher capability for complex analysis
- Best for non-sensitive research queries
- Uses OpenAI GPT-4 API

### Secure Mode (Llama 3)
- Data never leaves your premises
- HIPAA/GDPR compliant
- Lower latency for simple queries

Toggle between modes using the switch in the Navbar.

---

## 🤖 AI Agents

| Agent | Purpose |
|-------|---------|
| **Clinical Agent** | Analyzes clinical trial data, safety profiles, efficacy |
| **Patent Agent** | Maps IP landscape, FTO analysis, expiration tracking |
| **Market Agent** | ROI calculation, revenue projections, market sizing |
| **Vision Agent** | Molecular structure analysis, binding site identification |

---

## 📊 How to Use

1. Open http://localhost:5173
2. Enter a drug name (e.g., "Metformin", "Aspirin", "Imatinib")
3. Select privacy mode (Cloud/Secure) using the toggle in navbar
4. Click "Analyze" button
5. Wait for "Agents Thinking..." to complete
6. View results including ROI projections, clinical data, and patent info

---

## 📁 Project Structure

```
PharmaLens/
├── client/                    # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context providers
│   │   ├── pages/             # Page components
│   │   └── services/          # API service layer
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utilities (logger)
│   ├── logs/                  # Audit logs
│   └── package.json
│
├── ai_engine/                 # AI Core (Python + FastAPI)
│   ├── app/
│   │   ├── agents/            # AI agents (Clinical, Patent, Market, Vision)
│   │   ├── api/               # API endpoints
│   │   └── core/              # Core utilities (config, privacy toggle)
│   └── requirements.txt
│
├── docker-compose.yml
└── README.md
```

---

## 👥 Team Quick Setup (Copy-Paste Commands)

### Windows (PowerShell) - Run each block in separate terminals:

**Terminal 1 - AI Engine:**
```powershell
cd ai_engine
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Server:**
```powershell
cd server
npm install
npm run dev
```

**Terminal 3 - Client:**
```powershell
cd client
npm install
npm run dev
```

### macOS/Linux - Run each block in separate terminals:

**Terminal 1 - AI Engine:**
```bash
cd ai_engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Server:**
```bash
cd server
npm install
npm run dev
```

**Terminal 3 - Client:**
```bash
cd client
npm install
npm run dev
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for Pharmaceutical Innovation**
