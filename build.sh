#!/bin/bash

# TryneX eCommerce - Cloudflare Deployment Build Script
echo "🚀 Building TryneX eCommerce for Cloudflare Pages..."

# Set environment variables
export NODE_ENV=production
export VITE_API_URL=""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite/

# Install dependencies (if needed)
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
  npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build success
if [ -d "dist" ]; then
  echo "✅ Build successful! Files ready for Cloudflare Pages:"
  echo "   - Static files: dist/"
  echo "   - API functions: functions/api/"
  echo "   - Redirects: _redirects"
  
  echo ""
  echo "🌐 Next steps for Cloudflare deployment:"
  echo "1. Connect your repository to Cloudflare Pages"
  echo "2. Set build command: npm run build"
  echo "3. Set output directory: dist"
  echo "4. Set functions directory: functions"
  echo "5. Add environment variables in Cloudflare dashboard:"
  echo "   - DATABASE_URL"
  echo "   - SUPABASE_URL"
  echo "   - SUPABASE_ANON_KEY"
  echo "   - SUPABASE_SERVICE_KEY"
  echo "   - JWT_SECRET"
  echo ""
  echo "🧪 After deployment, test with: node test-cloudflare-deployment.js"
else
  echo "❌ Build failed! Check errors above."
  exit 1
fi