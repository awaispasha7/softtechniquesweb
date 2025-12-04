# Video Generation Credit System Setup

## Overview

The video generation feature now requires user authentication and uses a credit system to control access.

## Features

- **Authentication Required**: Users must sign in to generate videos
- **Credit System**: New users get 3 free credits
- **Admin Accounts**: Admin emails (configured via environment variable) get unlimited credits
- **Credit Management**: Admin API endpoints to manage user credits

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

**For Akenotech:**
- Add this to `Akenotech/.env.local`

**For SoftTechniques:**
- Add this to `softtechniquesweb/.env.local`

### 2. How It Works

#### New Users
- When a user signs up, they automatically receive **3 credits**
- If their email is in `ADMIN_EMAILS`, they get **unlimited credits** (`isUnlimited: true`)

#### Credit Usage
- Each video generation uses **1 credit**
- Credits are decremented when video generation starts
- Users with `isUnlimited: true` don't lose credits

#### Credit Display
- Users see their credit count on the `/generate-video` page
- Button is disabled when credits reach 0
- Unlimited accounts see "Unlimited" instead of a number

## Admin Credit Management

### API Endpoints

#### Get User Credits
```bash
GET /api/admin/credits?userId=USER_ID&adminEmail=YOUR_ADMIN_EMAIL
```

#### Add Credits
```bash
POST /api/admin/credits
Content-Type: application/json

{
  "userId": "USER_ID",
  "action": "add",
  "value": 10,
  "adminEmail": "your-admin@email.com"
}
```

#### Set Credits to Specific Amount
```bash
POST /api/admin/credits
Content-Type: application/json

{
  "userId": "USER_ID",
  "action": "set",
  "value": 5,
  "adminEmail": "your-admin@email.com"
}
```

#### Set Unlimited Credits
```bash
POST /api/admin/credits
Content-Type: application/json

{
  "userId": "USER_ID",
  "action": "setUnlimited",
  "value": true,
  "adminEmail": "your-admin@email.com"
}
```

### Manual Firestore Update

You can also manually update credits in Firebase Console:

1. Go to Firestore Database
2. Navigate to `users` collection
3. Find the user document
4. Update fields:
   - `credits`: number (e.g., 10)
   - `isUnlimited`: boolean (true for unlimited)

## User Experience

### Authenticated Users
- See their credit count on the video generation page
- Can generate videos if they have credits
- Button shows "No Credits" when credits are 0

### Unauthenticated Users
- See "Sign in to generate videos" message
- Redirected to login page if they try to generate
- Can still view example videos

### Admin Users
- See "Unlimited" instead of credit count
- Can generate unlimited videos
- Credits are not decremented

## Testing

1. **Test New User**: Sign up a new account → Should have 3 credits
2. **Test Credit Usage**: Generate a video → Credits should decrease by 1
3. **Test Admin**: Sign in with admin email → Should see "Unlimited"
4. **Test No Credits**: Use all credits → Button should be disabled

## Troubleshooting

### User has 0 credits but should have 3
- Check Firestore `users` collection
- Verify `credits` field exists (should be 3 for new users)
- If missing, manually set `credits: 3` in Firestore

### Admin email not getting unlimited credits
- Verify `ADMIN_EMAILS` environment variable is set correctly
- Check email matches exactly (case-sensitive)
- Restart the development server after changing `.env.local`
- You can also manually set `isUnlimited: true` in Firestore

### Credits not decrementing
- Check browser console for errors
- Verify user is authenticated
- Check Firestore permissions allow updates to `users` collection

