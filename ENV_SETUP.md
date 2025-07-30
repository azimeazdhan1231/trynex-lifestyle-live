
# Environment Setup for Trynex Lifestyle

## Cloudflare Pages Environment Variables

In your Cloudflare Pages dashboard, add these environment variables:

### Required Variables
```
DATABASE_URL=postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

SUPABASE_URL=https://lxhhgdqfxmeohayceshb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTk1OTAsImV4cCI6MjA2OTQ3NTU5MH0.gW9X6igqtpAQKutqb4aEEx0VovEZdMp4Gk_R8Glm9Bw
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg5OTU5MCwiZXhwIjoyMDY5NDc1NTkwfQ.zsYuh0P2S97pLrvY6t1j-qw-j-R_-_5QQX7e423dDeU
```

## Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: lxhhgdqfxmeohayceshb
3. Go to SQL Editor
4. Run the SQL script in `database_setup.sql`

## Test Admin Login
- Email: admin@trynex.com
- Password: admin123

## Build Settings for Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `dist/public`
- Root directory: (leave empty)
