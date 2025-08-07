#!/bin/bash

# Trynex Lifestyle - Simplified Build Script for Cloudflare Pages

echo "🚀 Starting Trynex Lifestyle build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the client (frontend)
echo "📦 Building client with Vite..."
npx vite build

echo "✅ Build completed successfully!"
echo "📂 Static files: dist/public"

# Verify build outputs
if [ -d "dist/public" ]; then
    echo "✅ Build artifacts verified!"
    ls -la dist/public/
    echo "🔧 Functions are pre-built and ready in functions/api/"
    ls -la functions/api/
else
    echo "❌ Build verification failed!"
    echo "Contents of dist:"
    ls -la dist/ || echo "dist/ does not exist"
    exit 1
fi