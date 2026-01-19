# 🔥 Firebase Rules Troubleshooting - Step by Step

## ⚠️ Still Getting Permission Errors?

Follow these steps **EXACTLY** to fix the issue:

## ✅ Step 1: Verify You're in the Correct Firebase Project

1. Go to: https://console.firebase.google.com/
2. **VERIFY** you see project: **`akeno-tech-blog`** (NOT `softtechniqueblog`)
3. If you see a different project, click the project dropdown and select **`akeno-tech-blog`**

## ✅ Step 2: Go to Firestore Rules

1. In left sidebar, click **"Firestore Database"**
2. Click **"Rules"** tab (at the top)
3. You should see the rules editor

## ✅ Step 3: Check Current Rules

**Your rules MUST look EXACTLY like this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Akeno Tech collection
    match /blogPosts/{document} {
      allow read, write: if true;
    }
    
    // SoftTechniques collection - MUST BE HERE!
    match /softtechniquesBlogPosts/{document} {
      allow read, write: if true;
    }
    
    // Case study submissions (if you have this)
    match /caseStudySubmissions/{document} {
      allow read, write: if true;
    }
  }
}
```

## ✅ Step 4: If Rules Are Missing, Add Them

1. **Copy the COMPLETE rules above**
2. **Delete everything** in the rules editor
3. **Paste the complete rules**
4. **Check for typos** - especially:
   - `softtechniquesBlogPosts` (exact spelling, case-sensitive)
   - `allow read, write: if true;` (with semicolon)

## ✅ Step 5: Publish Rules

1. Click the **"Publish"** button (blue button, top right)
2. Wait for the success message: **"Rules published successfully"**
3. **DO NOT** just save - you MUST click "Publish"!

## ✅ Step 6: Verify Rules Are Published

1. Look at the **left sidebar** - you should see a timeline
2. The latest entry should show **"Today"** with a timestamp
3. It should have a **star icon** ⭐ indicating it's the active version

## ✅ Step 7: Clear Browser Cache

1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select **"Cached images and files"**
3. Select **"All time"** or **"Last hour"**
4. Click **"Clear data"**

## ✅ Step 8: Hard Refresh Browser

1. On your blog page (`localhost:3000/blog`)
2. Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
3. This forces a complete reload

## ✅ Step 9: Restart Development Server

1. In your terminal, press `Ctrl + C` to stop the server
2. Wait 2-3 seconds
3. Start again: `npm run dev`
4. Wait for "Ready" message
5. Refresh browser again

## ✅ Step 10: Check Console Again

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors
4. If you still see permission errors, continue to Step 11

## ✅ Step 11: Double-Check Collection Name

The collection name in your code is: `softtechniquesBlogPosts`

**Verify in Firebase Console:**
1. Go to Firestore Database → **"Data"** tab (not Rules)
2. Look for a collection named: `softtechniquesBlogPosts`
3. If it doesn't exist, that's OK - it will be created when you add your first post
4. But the **rules must exist BEFORE** you can add posts!

## ✅ Step 12: Test Rules Directly

1. In Firebase Console → Firestore → Rules
2. Click **"Develop & Test"** button (top right)
3. This opens the Rules Playground
4. Test with:
   - Collection: `softtechniquesBlogPosts`
   - Operation: `read` or `write`
   - Should show: ✅ **"Allow"**

## 🔍 Common Mistakes

### ❌ Wrong Project
- Make sure you're in **`akeno-tech-blog`** project, NOT `softtechniqueblog`

### ❌ Typo in Collection Name
- Must be exactly: `softtechniquesBlogPosts` (case-sensitive)
- NOT: `softtechniquesblogposts` or `SoftTechniquesBlogPosts`

### ❌ Rules Not Published
- Just editing and saving is NOT enough
- You MUST click **"Publish"** button

### ❌ Browser Cache
- Old cached rules might still be active
- Clear cache and hard refresh

### ❌ Wrong Firebase Project in Code
- Check `src/lib/firebase.ts`
- Should have: `projectId: "akeno-tech-blog"`

## 🎯 Quick Verification Checklist

- [ ] In Firebase Console, project is **`akeno-tech-blog`**
- [ ] Rules include `match /softtechniquesBlogPosts/{document}`
- [ ] Rules show `allow read, write: if true;`
- [ ] Rules are **Published** (not just saved)
- [ ] Timeline shows today's publish date
- [ ] Browser cache cleared
- [ ] Hard refresh done (Ctrl + F5)
- [ ] Dev server restarted
- [ ] Console errors are gone

## 📞 Still Not Working?

If you've done ALL steps above and still get errors:

1. **Screenshot your Firebase Rules** (the exact code)
2. **Screenshot your browser console** (the exact error)
3. **Check the Firebase project** in `src/lib/firebase.ts` matches `akeno-tech-blog`

The issue is likely:
- Rules not published (most common)
- Wrong Firebase project selected
- Typo in collection name

