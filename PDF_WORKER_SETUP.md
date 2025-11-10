# PDF Worker Setup Guide

## Issue
PDF uploads are failing due to CORS errors when loading the PDF.js worker file from CDN.

## Solution

### Step 1: Install Dependencies
Make sure you have installed the required packages:

```bash
cd "softtechniquesweb-main/softtechniquesweb-main"
npm install
```

This will install:
- `pdfjs-dist` - For PDF parsing
- `mammoth` - For Word document parsing
- `cloudinary` - For file uploads

### Step 2: Copy Worker File (Optional but Recommended)

To avoid CORS issues completely, copy the worker file to your public folder:

1. Find the worker file in `node_modules/pdfjs-dist/build/`
2. Copy `pdf.worker.min.mjs` to `public/pdf.worker.min.mjs`

**Windows PowerShell:**
```powershell
Copy-Item "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" -Destination "public\pdf.worker.min.mjs"
```

**Windows CMD:**
```cmd
copy "node_modules\pdfjs-dist\build\pdf.worker.min.mjs" "public\pdf.worker.min.mjs"
```

**Mac/Linux:**
```bash
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

### Step 3: Restart Development Server

After copying the file, restart your Next.js development server:

```bash
npm run dev
```

## How It Works

The code will:
1. First try to load the worker from your local `public` folder (no CORS issues)
2. If that fails, fall back to CDN (jsdelivr or unpkg)

## Verification

After setup, try uploading a PDF document. It should work without CORS errors.

