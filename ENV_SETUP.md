
# Environment Variables Setup for Cloudflare Pages

## Required Environment Variables

In your Cloudflare Pages dashboard, go to Settings > Environment Variables and add these:

### Database Configuration
```
DATABASE_URL=postgresql://postgres.lxhhgdqfxmeohayceshb:Amiomito1Amiomito1@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Supabase Configuration
```
SUPABASE_URL=https://lxhhgdqfxmeohayceshb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTk1OTAsImV4cCI6MjA2OTQ3NTU5MH0.gW9X6igqtpAQKutqb4aEEx0VovEZdMp4Gk_R8Glm9Bw
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGhnZHFmeG1lb2hheWNlc2hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg5OTU5MCwiZXhwIjoyMDY5NDc1NTkwfQ.zsYuh0P2S97pLrvY6t1j-qw-j-R_-_5QQX7e423dDeU
```

## Build Settings

- **Build command**: `npm run build`
- **Build output directory**: `dist/public`
- **Root directory**: (leave empty)

## After Setting Environment Variables

1. Save the environment variables
2. Trigger a new deployment
3. The products should now load correctly on your live site

## Troubleshooting

If products still don't load:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Check that the Supabase database is accessible
4. Ensure the API routes are working in Functions tab
