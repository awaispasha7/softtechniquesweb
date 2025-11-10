# 🔥 Fix Firebase Permissions - Quick Guide for SoftTechniques

## ⚠️ Current Issue
Your blog is getting "Missing or insufficient permissions" errors because Firebase Firestore security rules are blocking access to the `softtechniquesBlogPosts` collection.

## ✅ Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your SoftTechniques project

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click **"Firestore Database"**
2. Click on the **"Rules"** tab (at the top)

### Step 3: Update Security Rules
**IMPORTANT:** Both Akeno Tech and SoftTechniques use the SAME Firebase project (`akeno-tech-blog`), so you need to ADD the SoftTechniques rule to your existing rules!

**If you already have rules for Akeno Tech (`blogPosts`), ADD this line to your existing rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Akeno Tech collection (already exists - keep this!)
    match /blogPosts/{document} {
      allow read, write: if true;
    }
    
    // ADD THIS: SoftTechniques collection
    match /softtechniquesBlogPosts/{document} {
      allow read, write: if true;
    }
  }
}
```

**If you're starting fresh, use the complete rules above.**

### Step 4: Publish Rules
1. Click the **"Publish"** button (blue button, top right)
2. Wait for confirmation that rules are published
3. **IMPORTANT:** You MUST click "Publish" - just saving is not enough!

### Step 5: Test Your Blog
1. Refresh your blog page (hard refresh: Ctrl + F5 or Cmd + Shift + R)
2. Try creating a new blog post
3. The permission errors should be gone!

## 🔒 Security Note

**For Development:** The rules above allow anyone to read/write (okay for testing)

**For Production:** You should add authentication and restrict access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /softtechniquesBlogPosts/{document} {
      // Allow read for everyone, write only for authenticated users
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📝 Your Firebase Project Details
- **Firebase Project ID:** `akeno-tech-blog` (shared with Akeno Tech)
- **Collection Name:** `softtechniquesBlogPosts`
- **Firebase Console:** https://console.firebase.google.com/project/akeno-tech-blog/firestore/databases/-default-/rules

## ✅ After Fixing
Once you update the rules:
- ✅ Blog posts will load from Firebase
- ✅ You can add new blog posts
- ✅ You can edit existing blog posts
- ✅ You can delete blog posts
- ✅ Images will upload correctly

## 🔍 Troubleshooting

If errors persist after updating rules:

1. **Clear Browser Cache:**
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cached images and files"
   - Click "Clear data"

2. **Restart Development Server:**
   - Stop your Next.js server (Ctrl + C in terminal)
   - Start it again: `npm run dev`

3. **Verify Rules Are Published:**
   - Go back to Firebase Console → Firestore → Rules
   - Check the timeline - you should see "Today" with your latest publish
   - Rules should show as "Published" (not "Draft")

4. **Check Collection Name:**
   - Make sure the collection name in Firebase matches exactly: `softtechniquesBlogPosts`
   - Case-sensitive!

## 🎯 Quick Copy-Paste Rule (COMPLETE - Includes Both Collections)

**Since both projects share the same Firebase, copy this COMPLETE block:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Akeno Tech collection
    match /blogPosts/{document} {
      allow read, write: if true;
    }
    
    // SoftTechniques collection (ADD THIS!)
    match /softtechniquesBlogPosts/{document} {
      allow read, write: if true;
    }
  }
}
```

Then click **"Publish"**!

## ⚠️ CRITICAL: Both Projects Share Same Firebase

Since both Akeno Tech and SoftTechniques use the same Firebase project (`akeno-tech-blog`), you MUST include rules for BOTH collections:
- `blogPosts` (Akeno Tech) - ✅ Already working
- `softtechniquesBlogPosts` (SoftTechniques) - ⚠️ Need to ADD this!

**If you only have `blogPosts` in your rules, SoftTechniques will still have errors!**

