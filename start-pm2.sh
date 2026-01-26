#!/bin/bash

# PM2 Startup Script for travel-admin
# This script ensures a clean PM2 start without conflicts

set -e  # Exit on error

echo "🚀 Starting travel-admin with PM2..."
echo ""

# ============================================
# Pre-flight Checks
# ============================================

echo "🔍 Running pre-flight checks..."

# 1. Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js version 18 or higher is required"
  echo "   Current version: $(node -v)"
  echo "   Please upgrade Node.js: https://nodejs.org/"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# 2. Check if .env file exists
if [ ! -f ".env" ]; then
  echo "❌ Error: .env file not found!"
  echo "   Please create .env file in $(pwd)"
  echo "   You can copy from .env.example if available"
  exit 1
fi
echo "✅ .env file found"

# 3. Check if standalone server exists
if [ ! -f ".next/standalone/server.js" ]; then
  echo "❌ Error: Standalone server not found!"
  echo "   Please run: pnpm build:prod"
  echo "   This will create .next/standalone/server.js"
  exit 1
fi
echo "✅ Standalone server found"

# 4. Check if public folder was copied
if [ ! -d ".next/standalone/public" ]; then
  echo "⚠️  Warning: public folder not found in standalone build"
  echo "   This might cause issues with static assets"
fi

# 5. Check if static folder was copied
if [ ! -d ".next/standalone/.next/static" ]; then
  echo "❌ Error: .next/static folder not found in standalone build!"
  echo "   Please run: pnpm build:prod"
  echo "   This will copy all required files"
  exit 1
fi
echo "✅ Static files found"

# 6. Check if port 3006 is available
if lsof -Pi :3006 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  Warning: Port 3006 is already in use"
  echo "   Existing process will be stopped by PM2"
fi

# 7. Create logs directory if it doesn't exist
mkdir -p logs
echo "✅ Logs directory ready"

echo ""
echo "✅ All pre-flight checks passed!"
echo ""

# ============================================
# PM2 Startup
# ============================================

# Delete existing PM2 process if any
echo "🗑️  Removing existing PM2 process..."
pm2 delete travel-admin 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Start PM2 with ecosystem config
echo "🚀 Starting PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

echo ""
echo "✅ travel-admin started successfully!"
echo ""
echo "📊 Useful commands:"
echo "   pm2 list                    - Show all processes"
echo "   pm2 logs travel-admin       - Show live logs"
echo "   pm2 logs travel-admin --err - Show error logs only"
echo "   pm2 monit                   - Monitor resources"
echo "   pm2 restart travel-admin    - Restart application"
echo "   pm2 stop travel-admin       - Stop application"
echo ""
