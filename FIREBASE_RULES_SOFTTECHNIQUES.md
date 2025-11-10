# 🔥 Firebase Rules for SoftTechniques Project

## ⚠️ IMPORTANT: SoftTechniques Uses Its Own Firebase Project

Your SoftTechniques blog now uses: **`softtechniqueblog`** project (NOT `akeno-tech-blog`)

## ✅ Step-by-Step: Add Firestore Rules

### Step 1: Go to SoftTechniques Firebase Project
1. Open: https://console.firebase.google.com/
2. **Select project:** `softtechniqueblog`
3. Verify URL shows: `project/softtechniqueblog`

### Step 2: Go to Firestore Rules
1. Click **"Firestore Database"** (left sidebar)
2. Click **"Rules"** tab

### Step 3: Add Rules for SoftTechniques Blog

**Copy and paste these rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // SoftTechniques blog posts collection
    match /softtechniquesBlogPosts/{document} {
      allow read, write: if true;
    }
  }
}
```

### Step 4: Publish Rules
1. Click **"Publish"** button (blue, top right)
2. Wait for: **"Rules published successfully"**
3. **MUST click Publish - saving is NOT enough!**

### Step 5: Verify
- Check URL: Should show `softtechniqueblog`
- Check timeline: Should show "Today" with timestamp
- Rules should include `softtechniquesBlogPosts`

### Step 6: Clear Cache & Refresh
1. Press `Ctrl + Shift + Delete`
2. Clear "Cached images and files"
3. Go to `localhost:3000/blog`
4. Press `Ctrl + F5` (hard refresh)

## ✅ That's It!

After publishing rules in the **`softtechniqueblog`** project, your SoftTechniques blog will work!

## 📝 Your Firebase Project Details
- **Project ID:** `softtechniqueblog`
- **Collection Name:** `softtechniquesBlogPosts`
- **Firebase Console:** https://console.firebase.google.com/project/softtechniqueblog

## 🔍 Quick Verification

Your `firebase.ts` now uses:
- Project ID: `softtechniqueblog` ✅
- Collection: `softtechniquesBlogPosts` ✅
- Rules must be in: `softtechniqueblog` project ✅

Make sure rules are published in the **`softtechniqueblog`** project!

