# Railway Deployment Configuration Guide

## Frontend Configuration for Railway Backend

Your frontend has been updated to work with your Railway-deployed backend. Here's what you need to do:

### 1. Set Environment Variables

**IMPORTANT:** Do NOT set `NEXT_PUBLIC_API_BASE_URL` in production. The app uses API proxy routes to avoid CORS issues.

For Railway deployment, set:
- `BACKEND_API_URL=https://web-production-608ab4.up.railway.app` (for the proxy routes)

**Local Development:**
Create a `.env.local` file:
```bash
# Backend URL for proxy routes (server-side only)
BACKEND_API_URL=http://localhost:8000
```

### 2. Railway Deployment Settings

**Frontend Service (Next.js):**
- Root directory: `softtechniquesweb-main (3)/softtechniquesweb-main` (if using monorepo structure)
- Build command: `next build --turbopack`
- Start command: `next start -p $PORT`
- Environment variables:
  - `BACKEND_API_URL=https://web-production-608ab4.up.railway.app` (for proxy routes)
  - **DO NOT SET** `NEXT_PUBLIC_API_BASE_URL` (leave it unset to use `/api` proxy routes)

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

For local development, set the backend URL for proxy routes:

```bash
BACKEND_API_URL=http://localhost:8000
```

The frontend will use `/api` routes which proxy to your local backend.

### 7. Troubleshooting

If you get CORS errors:
1. **Remove `NEXT_PUBLIC_API_BASE_URL` from production environment variables** - The app should use `/api` proxy routes
2. Set `BACKEND_API_URL` to your Railway backend URL (for the proxy routes)
3. Ensure both services are deployed and running
4. Test backend health: `curl https://web-production-608ab4.up.railway.app/health`
5. Test proxy route: `curl https://your-frontend-domain.com/api/chat` (should proxy to backend)