# CLOUDFLARE MANUAL DEPLOYMENT

## IMMEDIATE SOLUTION (Skip the broken GitHub integration):

### Step 1: Go to Cloudflare Dashboard
- Go to dash.cloudflare.com
- Click "Pages" 
- Click "Create a project"
- Choose "Upload assets" (NOT GitHub connection)

### Step 2: Upload your files
- Zip the entire 'dist' folder from your build
- Upload the zip file
- Project name: trynex-lifestyle

### Step 3: Environment Variables
Add these in Settings → Environment Variables:

DATABASE_URL = postgresql://postgres.uftbaywtpnwdhflujhsb:Azim12345678900@aws-0-ap-southeast-1.pooler.supabase.co:6543/postgres
SUPABASE_URL = https://uftbaywtpnwdhflujhsb.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdGJheXd0cG53ZGhmbHVqaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNTc0NjgsImV4cCI6MjAzOTczMzQ2OH0.C67BKQW1UnqcC0N4gkcgMRn3oKqgzfYNp3XVK4hG4QY
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdGJheXd0cG53ZGhmbHVqaHNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDE1NzQ2OCwiZXhwIjoyMDM5NzMzNDY4fQ.vFRhVnxY7hJOW7I1S5SIBZQhJV1O1kOhK8xk9tIhEZQ
JWT_SECRET = trynex_secret_key_2025
NODE_ENV = production

### Step 4: Deploy
- Click "Save and Deploy"
- Your site will be live immediately!

This bypasses the GitHub integration error completely.