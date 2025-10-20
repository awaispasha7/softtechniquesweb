# Railway Deployment Configuration Guide

## Frontend Configuration for Railway Backend

Your frontend has been updated to work with your Railway-deployed backend. Here's what you need to do:

### 1. Set Environment Variable

Create a `.env.local` file in your project root with your Railway URL:

```bash
# Your actual Railway deployment URL
NEXT_PUBLIC_API_BASE_URL=https://web-production-608ab4.up.railway.app
```

### 2. Railway Deployment Settings

**Frontend Service (Next.js):**
- Root directory: `softtechniquesweb-main (3)/softtechniquesweb-main` (if using monorepo structure)
- Build command: `next build --turbopack`
- Start command: `next start -p $PORT`
- Environment variables:
  - `NEXT_PUBLIC_API_BASE_URL=https://web-production-608ab4.up.railway.app`

**Backend Service (FastAPI):**
- Environment variables:
  - `ALLOWED_ORIGINS=https://softtechniquesweb-production.up.railway.app,http://localhost:3000`

### 3. CORS Configuration

Your backend CORS is configured to read from `ALLOWED_ORIGINS` environment variable:

```python
# In main.py
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
_allowed_origins_list = [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]
```

### 4. Test the Connection

After deployment, test:
- Chat functionality
- Consultation scheduling
- All API endpoints should now point to your Railway backend

### 5. Files Updated

- `src/config/api.ts` - API configuration file
- `src/components/ChatInterface.tsx` - Updated to use Railway API
- `src/app/schedule/page.tsx` - Updated to use Railway API

### 6. Local Development

For local development, you can override the environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

This allows you to test locally while keeping the production configuration pointing to Railway.

### 7. Troubleshooting

If you get CORS errors:
1. Verify `ALLOWED_ORIGINS` on backend includes your exact frontend domain
2. Check that `NEXT_PUBLIC_API_BASE_URL` on frontend points to your backend
3. Ensure both services are deployed and running
4. Test backend health: `curl https://web-production-608ab4.up.railway.app/health`