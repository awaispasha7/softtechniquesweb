# 🔑 How to Check Your Firebase API Key - Step by Step

## ✅ Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/
2. **Select your project:** `akeno-tech-blog`
   - Click the project dropdown (top left)
   - Make sure `akeno-tech-blog` is selected

## ✅ Step 2: Go to Project Settings

1. Click the **gear icon** ⚙️ (next to "Project Overview" in left sidebar)
2. Click **"Project settings"**

## ✅ Step 3: Find Your API Key

1. Scroll down to **"Your apps"** section
2. You'll see a list of apps (web apps, iOS, Android, etc.)
3. Look for your **web app** (it might be named "Web app" or have a specific name)
4. Click on the web app to expand it

## ✅ Step 4: View Configuration

You'll see your Firebase configuration object with:
- **apiKey:** `AIzaSyCBfeGok3BekmDKMApuqgFw3jOTZqlPZ4k`
- **authDomain:** `akeno-tech-blog.firebaseapp.com`
- **projectId:** `akeno-tech-blog`
- **storageBucket:** `akeno-tech-blog.firebasestorage.app`
- **messagingSenderId:** `971660241179`
- **appId:** `1:971660241179:web:d89bf456de20efd02bcbbe`
- **measurementId:** `G-04GNCJD3XZ`

## ✅ Step 5: Compare with Your Code

Compare the values in Firebase Console with your `firebase.ts` file:

**Your current code shows:**
```javascript
apiKey: "AIzaSyCBfeGok3BekmDKMApuqgFw3jOTZqlPZ4k"
authDomain: "akeno-tech-blog.firebaseapp.com"
projectId: "akeno-tech-blog"
storageBucket: "akeno-tech-blog.firebasestorage.app"
messagingSenderId: "971660241179"
appId: "1:971660241179:web:d89bf456de20efd02bcbbe"
measurementId: "G-04GNCJD3XZ"
```

**If they match:** ✅ Your configuration is correct!

**If they don't match:** ⚠️ Update your `firebase.ts` file with the correct values

## ✅ Step 6: Alternative - View in General Tab

1. In Project Settings, click **"General"** tab (if not already selected)
2. Scroll to **"Your apps"** section
3. Find your web app
4. Click the **</>** icon or **"Config"** button
5. You'll see the complete Firebase config

## ✅ Step 7: Copy New Config (If Needed)

If you need to create a new web app or get a new config:

1. In Project Settings → **"General"** tab
2. Scroll to **"Your apps"** section
3. Click **"Add app"** → Select **"Web"** (</> icon)
4. Register your app (give it a name)
5. Copy the config object
6. Replace the values in your `firebase.ts` file

## 🔍 Quick Verification Checklist

- [ ] Project ID matches: `akeno-tech-blog`
- [ ] API Key matches: `AIzaSyCBfeGok3BekmDKMApuqgFw3jOTZqlPZ4k`
- [ ] Auth Domain matches: `akeno-tech-blog.firebaseapp.com`
- [ ] All values in code match Firebase Console

## ⚠️ Important Notes

1. **API Key is Public:** The API key in your code is safe to expose - it's meant to be public
2. **Security is in Rules:** Your Firestore security rules protect your data, not the API key
3. **Same Project:** Both Akeno Tech and SoftTechniques use the same Firebase project
4. **Don't Share Secret Keys:** Never share your `api_secret` (Cloudinary) or service account keys

## 🎯 Direct Link to Project Settings

https://console.firebase.google.com/project/akeno-tech-blog/settings/general

## 📝 Your Current Configuration (From Code)

Based on your `firebase.ts` file, your configuration is:

```javascript
{
  apiKey: "AIzaSyCBfeGok3BekmDKMApuqgFw3jOTZqlPZ4k",
  authDomain: "akeno-tech-blog.firebaseapp.com",
  projectId: "akeno-tech-blog",
  storageBucket: "akeno-tech-blog.firebasestorage.app",
  messagingSenderId: "971660241179",
  appId: "1:971660241179:web:d89bf456de20efd02bcbbe",
  measurementId: "G-04GNCJD3XZ"
}
```

**Verify these match what you see in Firebase Console!**

