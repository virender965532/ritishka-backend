#!/bin/bash

echo "🚀 Starting develop deployment..."

# Navigate to project directory
cd ~/ritishka-backend || exit

# Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin develop

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the project (if needed)
echo "🔨 Building project..."
npm run dev || echo "⚠️ No build step found, skipping..."

# Restart PM2
echo "♻️ Restarting PM2 process..."
pm2 restart ritishka-backend

echo "✅ Deployment completed!"
