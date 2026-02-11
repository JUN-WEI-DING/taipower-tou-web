#!/bin/bash
# Start script for taipower-tou web UI

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Set PYTHONPATH to include project root
export PYTHONPATH="$PROJECT_ROOT:$PYTHONPATH"

# Function to cleanup on exit
cleanup() {
    echo "Shutting down..."
    # Kill backend by PID if still running
    if [ -n "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
    fi
    # Kill frontend by PID if still running
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Start backend server
echo "Starting FastAPI backend on http://localhost:8000..."
cd "$PROJECT_ROOT"
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend started successfully (PID: $BACKEND_PID)"
    echo "API documentation available at: http://localhost:8000/docs"
else
    echo "Failed to start backend"
    exit 1
fi

# Start frontend dev server
echo "Starting Vite frontend on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort &
FRONTEND_PID=$!

# Wait a bit for frontend to start
sleep 2

# Check if frontend started successfully
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "Frontend started successfully (PID: $FRONTEND_PID)"
else
    echo "Failed to start frontend (port 5173 may already be in use)"
    cleanup
    exit 1
fi
echo ""
echo "=========================================="
echo "  taipower-tou Web UI is now running!"
echo "=========================================="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="
echo ""

# Wait for any process to exit
wait -n
cleanup
