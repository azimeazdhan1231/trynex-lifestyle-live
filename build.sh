#!/bin/bash

echo "🚀 Building for Cloudflare Pages..."

# Install dependencies
npm install

# Build the application
npm run build

# Create the public directory structure for Cloudflare Pages
mkdir -p dist
cp -r client/dist/* dist/

# Copy static files
cp _redirects dist/
cp -r functions dist/

echo "✅ Build complete! Ready for Cloudflare Pages deployment."
echo "📁 Output directory: dist/"
echo "🌐 Functions: dist/functions/"
echo "🔄 Redirects: dist/_redirects"