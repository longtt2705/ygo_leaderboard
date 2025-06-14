# Vercel Deployment Guide

## Why Leaderboard Sync Doesn't Work on Vercel

The most common reasons the sync works locally but not on Vercel:

1. **Missing Environment Variables** - Your `.env.local` file isn't deployed
2. **Firebase Security Rules** - Production rules might be more restrictive
3. **Serverless Function Timeouts** - Sync operations might timeout
4. **Build-time vs Runtime Issues** - Environment variables not available at runtime

## Step-by-Step Fix

### 1. Set Environment Variables on Vercel

Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these variables (get values from your local `.env.local`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=yugioh_archetypes
```

**Important**: Set these for all environments (Production, Preview, Development)

### 2. Check Firebase Security Rules

In Firebase Console → Firestore Database → Rules, ensure you have:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Verify Firebase Project Settings

1. Go to Firebase Console → Project Settings
2. Under "General" tab, check "Public settings"
3. Ensure your domain is added to "Authorized domains"
4. Add your Vercel domain: `your-app.vercel.app`

### 4. Test Environment Variables

Add this debug page to check if variables are loaded:

Create `/src/app/debug-env/page.tsx`:

```typescript
'use client';

export default function DebugEnvPage() {
    const envVars = {
        FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
        FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
        FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
        FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
        FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
            <div className="space-y-2">
                {Object.entries(envVars).map(([key, status]) => (
                    <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span>{status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### 5. Add Error Logging

Update your sync function to log errors better:

```typescript
// In firebaseService.ts
export async function syncPlayerStats(): Promise<void> {
  try {
    console.log('Starting sync operation...');
    
    const [players, matches] = await Promise.all([
      getAllPlayers(),
      getAllMatches()
    ]);
    
    console.log(`Found ${players.length} players and ${matches.length} matches`);
    
    // ... rest of sync logic
    
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Sync failed:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}
```

### 6. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions tab
2. Look for any error logs during sync operations
3. Check if functions are timing out (default 10s limit)

### 7. Increase Function Timeout (if needed)

Add to `vercel.json` in your project root:

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 8. Test the Fix

1. Deploy your changes to Vercel
2. Visit `/debug-env` to verify environment variables
3. Try the sync operation from `/admin`
4. Check Vercel function logs for any errors

## Common Issues & Solutions

### Issue: "Firebase not initialized"
**Solution**: Environment variables not set on Vercel

### Issue: "Permission denied"
**Solution**: Check Firebase security rules and authentication

### Issue: "Function timeout"
**Solution**: Optimize sync function or increase timeout

### Issue: "Network error"
**Solution**: Check Firebase project settings and authorized domains

## Debugging Steps

1. **Check Environment Variables**: Visit `/debug-env` on your deployed site
2. **Check Firebase Console**: Look for authentication and database activity
3. **Check Vercel Logs**: Look for function execution logs and errors
4. **Test Locally**: Ensure sync works with production Firebase config locally

## Quick Test

After setting up environment variables on Vercel:

1. Redeploy your app
2. Visit your deployed site
3. Go to `/admin` and try the sync operation
4. Check the browser console and Vercel function logs for any errors

The sync should now work on Vercel just like it does locally! 