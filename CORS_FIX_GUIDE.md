# CORS Fix Guide - Railway Production

## Problem
The chatbot is showing CORS errors in production because `NEXT_PUBLIC_API_BASE_URL` is set to the direct backend URL, bypassing the proxy routes.

## Solution

### Step 1: Update Railway Environment Variables

In your Railway dashboard for the **frontend service**:

1. **REMOVE** the environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` ❌ (DELETE THIS)

2. **ADD** the environment variable:
   - `BACKEND_API_URL=https://web-production-608ab4.up.railway.app` ✅

### Step 2: Redeploy

After updating environment variables, Railway will automatically redeploy. Wait for the deployment to complete.

### Step 3: Verify

1. Check that the frontend is using `/api/chat` (not direct backend URL)
2. Open browser console and check network requests
3. Chat requests should go to: `https://softtechniques.com/api/chat`
4. No CORS errors should appear

## How It Works

- Frontend calls: `/api/chat` (same origin, no CORS)
- Next.js API route proxies to: `https://web-production-608ab4.up.railway.app/chat`
- Backend responds through the proxy
- No CORS issues! ✅

## Current Status

✅ Code is correct (works on localhost)
❌ Production has wrong environment variable set
🔧 Fix: Remove `NEXT_PUBLIC_API_BASE_URL`, add `BACKEND_API_URL`


