#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════╗"
echo "║        L U M E L L U M       ║"
echo "║      sharpen your thoughts   ║"
echo "╚══════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed."
  echo "   Install it from https://nodejs.org/ (version 18 or higher)"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. You have $(node -v)."
  echo "   Install a newer version from https://nodejs.org/"
  exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm is required but not installed."
  echo "   It usually comes with Node.js: https://nodejs.org/"
  exit 1
fi

# Check git
if ! command -v git &> /dev/null; then
  echo "❌ git is required but not installed."
  echo "   macOS: xcode-select --install"
  echo "   Linux: sudo apt install git  (or your distro's package manager)"
  exit 1
fi

# Clone or update
if [ -d "$HOME/lumellum" ]; then
  echo "→ Updating existing installation..."
  cd "$HOME/lumellum"
  git pull
else
  echo "→ Cloning Lumellum..."
  git clone https://github.com/OldEphraim/lumellum "$HOME/lumellum"
  cd "$HOME/lumellum"
fi

# Install dependencies
echo "→ Installing dependencies..."
npm install --silent

# Prompt for API keys
echo ""
read -rp "Enter your Anthropic API key: " ANTHROPIC_API_KEY
read -rp "Enter your Tavily API key (get one free at app.tavily.com): " TAVILY_API_KEY

# Write .env
cat > .env <<EOL
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
TAVILY_API_KEY=${TAVILY_API_KEY}
EOL

echo ""
echo "→ .env file written."

# Find a free port
PORT=3000
while [ "$PORT" -le 3010 ]; do
  if ! lsof -i :"$PORT" &> /dev/null; then
    break
  fi
  PORT=$((PORT + 1))
done

if [ "$PORT" -gt 3010 ]; then
  echo "❌ Could not find a free port between 3000 and 3010."
  exit 1
fi

export PORT

echo "→ Starting Lumellum on port $PORT..."
node --env-file=.env --import tsx/esm src/index.ts &
SERVER_PID=$!

sleep 2

# Open in browser
URL="http://localhost:${PORT}/app"
if command -v open &> /dev/null; then
  open "$URL"
elif command -v xdg-open &> /dev/null; then
  xdg-open "$URL"
else
  echo "Open this in your browser: $URL"
fi

echo ""
echo "Lumellum is running at $URL"
echo "Press Ctrl+C to stop."

wait $SERVER_PID
