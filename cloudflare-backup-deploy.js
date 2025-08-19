#!/usr/bin/env node

/**
 * Emergency Cloudflare Deployment Script
 * This bypasses the internal error by creating a minimal deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Creating emergency Cloudflare deployment...');

// Create minimal wrangler.toml
const wranglerConfig = `
name = "trynex-lifestyle"
compatibility_date = "2024-12-01"
pages_build_output_dir = "dist"

[build]
command = "npm install && npm run build"

[env.production.vars]
NODE_ENV = "production"
DATABASE_URL = "postgresql://postgres.uftbaywtpnwdhflujhsb:Azim12345678900@aws-0-ap-southeast-1.pooler.supabase.co:6543/postgres"
SUPABASE_URL = "https://uftbaywtpnwdhflujhsb.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdGJheXd0cG53ZGhmbHVqaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNTc0NjgsImV4cCI6MjAzOTczMzQ2OH0.C67BKQW1UnqcC0N4gkcgMRn3oKqgzfYNp3XVK4hG4QY"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdGJheXd0cG53ZGhmbHVqaHNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE1NzQ2OCwiZXhwIjoyMDM5NzMzNDY4fQ.vFRhVnxY7hJOW7I1S5SIBZQhJV1O1kOhK8xk9tIhEZQ"
JWT_SECRET = "trynex_secret_key_2025"
`;

// Create simple redirects
const redirects = `/api/* /api/:splat 200
/* /index.html 200`;

// Create deployment instructions
const instructions = `
# EMERGENCY DEPLOYMENT INSTRUCTIONS

## Option 1: Replit Deployment (IMMEDIATE)
1. Click the Deploy button in Replit interface
2. Choose "Replit Deployments" 
3. Your site will be live at [project-name].replit.app
4. Configure custom domain in deployment settings

## Option 2: Manual Cloudflare (BACKUP)
1. Build locally: npm run build
2. Go to Cloudflare Pages Dashboard
3. Create new project → Upload assets
4. Drag & drop the 'dist' folder
5. Configure environment variables manually

## Option 3: Cloudflare CLI (ADVANCED)
1. Install Wrangler: npm install -g wrangler
2. Login: wrangler login
3. Deploy: wrangler pages publish dist --project-name=trynex-lifestyle

## Environment Variables for Cloudflare:
Copy these into Cloudflare Dashboard → Pages → Settings → Environment Variables:

DATABASE_URL = postgresql://postgres.uftbaywtpnwdhflujhsb:Azim12345678900@aws-0-ap-southeast-1.pooler.supabase.co:6543/postgres
SUPABASE_URL = https://uftbaywtpnwdhflujhsb.supabase.co  
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdGJheXd0cG53ZGhmbHVqaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNTc0NjgsImV4cCI6MjAzOTczMzQ2OH0.C67BKQW1UnqcC0N4gkcgMRn3oKqgzfYNp3XVK4hG4QY
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdGJheXd0cG53ZGhmbHVqaHNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE1NzQ2OCwiZXhwIjoyMDM5NzMzNDY4fQ.vFRhVnxY7hJOW7I1S5SIBZQhJV1O1kOhK8xk9tIhEZQ
JWT_SECRET = trynex_secret_key_2025
NODE_ENV = production
`;

// Write files
fs.writeFileSync('wrangler-emergency.toml', wranglerConfig.trim());
fs.writeFileSync('_redirects-backup', redirects);
fs.writeFileSync('EMERGENCY_DEPLOY.md', instructions.trim());

console.log('✅ Emergency deployment files created!');
console.log('📁 Files created:');
console.log('   - wrangler-emergency.toml');
console.log('   - _redirects-backup'); 
console.log('   - EMERGENCY_DEPLOY.md');
console.log('');
console.log('🚀 IMMEDIATE ACTION: Use Replit Deploy button now!');