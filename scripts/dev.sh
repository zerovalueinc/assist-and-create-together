#!/bin/bash

set -e

# Kill all Node.js, Vite, and npm processes
printf "\n\033[1;33m[PersonaOps] Killing all Node, Vite, and npm servers...\033[0m\n"
pkill -f 'node|vite|npm' 2>/dev/null || true
sleep 1

# Build backend
printf "\n\033[1;34m[PersonaOps] Building backend...\033[0m\n"
npm run server:build

# Start backend in background
printf "\n\033[1;32m[PersonaOps] Starting backend server...\033[0m\n"
npm run server:dev &
BACKEND_PID=$!
sleep 2

# Start frontend in foreground
printf "\n\033[1;36m[PersonaOps] Starting frontend (Vite)...\033[0m\n"
npm run dev

# On exit, kill backend
trap "echo; echo '[PersonaOps] Shutting down backend...'; kill $BACKEND_PID 2>/dev/null || true" EXIT 