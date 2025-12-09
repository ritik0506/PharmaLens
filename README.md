# PharmaLens

An intelligent pharmaceutical analysis platform with AI-powered insights and real-time data processing.

## Project Structure

```
PharmaLens/
├── ai_engine/          # Python AI/ML backend
├── server/             # Node.js API server
├── client/             # React frontend
└── docs/              # Documentation
```

## Prerequisites

- **Python 3.8+** (for AI engine)
- **Node.js 16+** (for server and client)
- **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ritik0506/PharmaLens.git
cd PharmaLens
```

### 2. Set Up AI Engine (Python Backend)

```bash
cd ai_engine

# Install dependencies (globally or in venv)
pip install -r requirements.txt

# Copy environment file
copy .env.example .env
# Edit .env and add your OpenAI API key for LLM features
# Note: App works in deterministic mode without API key
```

### 3. Set Up Server (Node.js Backend)

```bash
cd ../server

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
# Edit .env if needed
```

### 4. Set Up Client (React Frontend)

```bash
cd ../client

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
# Edit .env if needed
```

## Running the Application

### Option 1: Quick Start (Windows - Recommended)
```powershell
# Run the startup script (starts all services automatically)
.\start.ps1
```

### Option 2: Manual Start

**Terminal 1: Start AI Engine**
```bash
cd ai_engine
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2: Start Server**
```bash
cd server
npm start
```

**Terminal 3: Start Client**
```bash
cd client
npm run dev
```

> **Note**: No virtual environment is required if Python dependencies are installed globally.

## Access the Application

- **Frontend**: http://localhost:5173 (or 5174 if 5173 is in use)
- **API Server**: http://localhost:3001
- **AI Engine**: http://localhost:8000

## Environment Variables

### AI Engine (.env)
- `OPENAI_API_KEY`: Your OpenAI API key (optional, enables GPT-4 powered agents)
- `CLOUD_ENABLED`: Enable/disable cloud LLM
- `LOCAL_ENABLED`: Enable/disable local model
- `LOCAL_MODEL_PATH`: Path to local Llama model file (.gguf)

**Note**: Application works perfectly without LLM configuration using deterministic responses.

**To enable AI-powered insights:**
- **Quick Setup**: Run `.\setup-llm.ps1` (interactive configuration)
- **Detailed Guide**: See `LLM_SETUP_GUIDE.md`

### Server (.env)
- `PORT`: Server port (default: 3001)
- `CLIENT_URL`: Frontend URL for CORS
- `AI_ENGINE_URL`: AI engine URL

### Client (.env)
- `VITE_API_URL`: Backend API URL

## Features

- 🤖 **AI-powered pharmaceutical analysis** (Cloud GPT-4 or Local Llama)
- ⚡ **Real-time data processing** with 12 specialized agents
- 📊 **Interactive dashboard** with ROI calculations
- 🎯 **Multi-agent system** (IQVIA, Clinical, Patent, Market, etc.)
- 🔒 **Dual LLM support**: Cloud (OpenAI) or Local (HIPAA-compliant)
- 🧪 **Deterministic mode** for testing without LLM

### LLM Configuration
The application supports three modes:
1. **Cloud Mode** - OpenAI GPT-4 (best quality, requires API key)
2. **Local Mode** - Llama models (HIPAA-compliant, requires model download)
3. **Deterministic Mode** - Pre-programmed responses (no setup required)

See `LLM_SETUP_GUIDE.md` for configuration instructions.

## Documentation

Detailed documentation is available in the `docs/` directory:
- [Quick Start Guide](docs/setup/QUICK_START.md)
- [Architecture Overview](docs/architecture/)
- [LLM Integration](docs/llm/)

## Contributing

When working on this project:
1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Common Issues

### Port Already in Use
If you get a port conflict error, change the port in the respective `.env` file.

### Dependencies Not Installing
Make sure you're using compatible versions of Python and Node.js.

### Virtual Environment Issues
Ensure you've activated the virtual environment before installing Python packages or running the AI engine.

## Team Collaboration

Each team member should:
1. Clone the repository
2. Set up all three components (ai_engine, server, client)
3. Copy `.env.example` to `.env` in each directory
4. Install dependencies
5. Create a new branch for their work

## License

MIT License - See LICENSE file for details
