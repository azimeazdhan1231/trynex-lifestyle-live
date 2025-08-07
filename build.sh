#!/bin/bash

# Trynex Lifestyle - Automated Build Script for Cloudflare Pages

echo "🚀 Starting Trynex Lifestyle build process..."

# Build the client (frontend)
echo "📦 Building client..."
npm run build:client || vite build

# Create functions directory if it doesn't exist
mkdir -p functions/api

# Build the functions (backend API)
echo "⚡ Building Cloudflare Functions..."
npx esbuild server/index.ts --bundle --platform=node --format=esm --outfile=functions/api/[[path]].js --packages=external --define:process.env.NODE_ENV='"production"'

echo "✅ Build completed successfully!"
echo "📂 Static files: dist/public"
echo "🔧 API functions: functions/api/[[path]].js"

# Verify build outputs
if [ -d "dist/public" ] && [ -f "functions/api/[[path]].js" ]; then
    echo "✅ All build artifacts verified!"
else
    echo "❌ Build verification failed!"
    exit 1
fi