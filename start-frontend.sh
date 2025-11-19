#!/bin/bash

echo "🎨 Starting Frontend..."

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "VITE_API_URL=http://localhost:8000" > .env
fi

echo "✅ Starting Vite dev server on http://localhost:5173"
echo ""

npm run dev
