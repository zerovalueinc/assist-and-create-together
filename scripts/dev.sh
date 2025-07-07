#!/bin/bash

set -e

# Check for node_modules and install dependencies if missing
if [ ! -d "node_modules" ]; then
  printf "\n\033[1;33m[PersonaOps] Installing npm dependencies...\033[0m\n"
  npm install
fi

# Ensure TypeScript is installed
if ! npx tsc --version >/dev/null 2>&1; then
  printf "\n\033[1;33m[PersonaOps] Installing TypeScript...\033[0m\n"
  npm install --save-dev typescript
fi

# Initialize database if missing
db_file="data/personaops.db"
if [ ! -f "$db_file" ]; then
  printf "\n\033[1;33m[PersonaOps] Initializing database...\033[0m\n"
  if [ -f "server/database/init.js" ]; then
    node server/database/init.js
  elif [ -f "server/database/init.ts" ]; then
    npx ts-node server/database/init.ts
  else
    printf "\n\033[1;31m[PersonaOps] No database init script found!\033[0m\n"
    exit 1
  fi
fi

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