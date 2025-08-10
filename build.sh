#!/bin/bash

# Trynex Lifestyle - Optimized Build Script for Cloudflare Pages

echo "🚀 Starting Trynex Lifestyle build process..."

# Set production environment
export NODE_ENV=production
export CI=true

# Install dependencies with cache
echo "📦 Installing dependencies..."
npm ci --no-optional --prefer-offline

# Build the client only (frontend)
echo "📦 Building client with Vite..."
npm run build:static || npx vite build --mode production

echo "✅ Build completed successfully!"
echo "📂 Static files ready in: dist/public"

# Verify build outputs
if [ -d "dist/public" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Build artifacts verified!"
    echo "📄 Main files:"
    ls -la dist/public/*.html || echo "No HTML files found"
    ls -la dist/public/assets/*.js | head -5 || echo "No JS files found"
    echo "🔧 Cloudflare Functions ready in: functions/"
    ls -la functions/ || echo "No functions directory"
else
    echo "❌ Build verification failed!"
    echo "Contents of dist:"
    ls -la dist/ || echo "dist/ directory missing"
    echo "Contents of root:"
    ls -la . | head -20
    exit 1
fi