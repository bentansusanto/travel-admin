#!/bin/bash

# PM2 Startup Script for travel-admin
# This script ensures a clean PM2 start without conflicts

echo "🚀 Starting travel-admin with PM2..."

# Delete existing PM2 process if any
pm2 delete travel-admin 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Start PM2 with ecosystem config
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

echo "✅ travel-admin started successfully!"
echo "📊 Check status with: pm2 list"
echo "📝 Check logs with: pm2 logs travel-admin"
