# 🔥 Final Firebase Rules - Copy This EXACTLY

## ⚠️ IMPORTANT: Use the CORRECT Firebase Project

Your code uses: **`akeno-tech-blog`** project

**DO NOT use `softtechniqueblog` project!**

## ✅ Step-by-Step Fix

### Step 1: Go to CORRECT Firebase Project
1. Open: https://console.firebase.google.com/
2. **Click the project dropdown** (top left)
3. **Select: `akeno-tech-blog`** (NOT softtechniqueblog!)
4. Verify URL shows: `project/akeno-tech-blog`

### Step 2: Go to Firestore Rules
1. Click **"Firestore Database"** (left sidebar)
2. Click **"Rules"** tab

### Step 3: Copy and Paste These Rules

**Delete everything** in the rules editor and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Akeno Tech blog posts
    match /blogPosts/{document} {
      allow read, write: if true;
    }
    
    // SoftTechniques blog posts
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
- Check URL: Should show `akeno-tech-blog` (NOT `softtechniqueblog`)
- Check timeline: Should show "Today" with timestamp
- Rules should have both `blogPosts` and `softtechniquesBlogPosts`

### Step 6: Clear Cache & Refresh
1. Press `Ctrl + Shift + Delete`
2. Clear "Cached images and files"
3. Go to `localhost:3000/blog`
4. Press `Ctrl + F5` (hard refresh)

## ✅ That's It!

After publishing in the **`akeno-tech-blog`** project, your SoftTechniques blog will work!

## 🔍 Why This Works

- Your code connects to: `akeno-tech-blog` project
- Akeno Tech uses: `blogPosts` collection ✅
- SoftTechniques uses: `softtechniquesBlogPosts` collection ✅
- Both collections are in the SAME Firebase project
- Rules must be in the SAME project your code connects to!

