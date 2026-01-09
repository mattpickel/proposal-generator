#!/bin/bash

# Start both frontend and backend servers for proposal-generator

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting Proposal Generator..."

# Kill any existing processes on the ports (Linux-compatible)
echo "Cleaning up ports 3002 and 5175..."
fuser -k 3002/tcp 2>/dev/null || lsof -ti:3002 | xargs kill -9 2>/dev/null || true
fuser -k 5175/tcp 2>/dev/null || lsof -ti:5175 | xargs kill -9 2>/dev/null || true

# Start backend
echo "Starting backend on port 3002..."
(cd "$SCRIPT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on port 5175..."
(cd "$SCRIPT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Servers starting..."
echo "  Backend:  http://localhost:3002"
echo "  Frontend: http://localhost:5175"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C and cleanup
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Keep script running
wait
