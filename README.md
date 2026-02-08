# taipower-tou-web

Web interface for [taipower-tou](https://github.com/JUN-WEI-DING/taipower-tou) - Taiwan Time-of-Use Electricity Tariff Calculator.

## Features

- Upload CSV usage data and calculate electricity costs
- Compare multiple tariff plans
- Support for residential and low-voltage power plans
- Interactive UI with real-time validation

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- [taipower-tou](https://pypi.org/project/taipower-tou/) Python package

### Installation

```bash
# Install Python dependencies
pip install -e ".[backend]"

# Install frontend dependencies
cd frontend
npm install
```

### Running

```bash
# Start both backend and frontend
./start-web.sh
```

Or start separately:

```bash
# Backend (port 8000)
export PYTHONPATH="$PWD:$PYTHONPATH"
python -m uvicorn backend.main:app --reload

# Frontend (port 5173) - in another terminal
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

## API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

## Project Structure

```
taipower-tou-web/
├── backend/          # FastAPI backend
├── frontend/         # React + TypeScript frontend
├── start-web.sh      # Startup script
├── examples/         # Sample CSV files
└── tests/            # E2E and API tests
```

## License

MIT License - see [LICENSE](https://github.com/JUN-WEI-DING/taipower-tou/blob/main/LICENSE) in the main repository.
