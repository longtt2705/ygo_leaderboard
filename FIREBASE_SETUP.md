# Firebase Setup Guide

## Prerequisites
- A Google account
- Node.js installed on your machine

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `yugioh-leaderboard` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", and add your project support email

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select your preferred location
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. Register your app with name: `yugioh-leaderboard-admin`
5. Copy the configuration object

## Step 5: Configure Environment Variables

1. In your project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Step 6: Create Admin User

Since this is an admin-only system, you need to create your admin account:

### Option 1: Using Firebase Console
1. Go to **Authentication** > **Users**
2. Click "Add user"
3. Enter your admin email and password
4. Click "Add user"

### Option 2: Using Google Sign-in
1. Just use the "Sign in with Google" button on the login page
2. Your Google account will be automatically added

## Step 7: Secure Firestore Rules (Optional but Recommended)

1. Go to **Firestore Database** > **Rules**
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Only authenticated users can read/write
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Click "Publish"

## Step 8: Run the Application

```bash
npm run dev
```

The application will now require authentication before showing the leaderboard. Only users you've added to Firebase Authentication can access the admin panel.

## Features Available

- **Admin Authentication**: Email/password and Google sign-in
- **Real-time Data**: Firestore integration for live updates
- **Player Management**: CRUD operations for players
- **Match Recording**: Track match results and ELO changes
- **Leaderboard**: Automatic ranking and tier calculation

## Security Notes

- The current setup allows any authenticated user to access the admin panel
- For production use, consider implementing role-based access control
- Regularly review your Firebase security rules
- Monitor authentication logs in Firebase Console

## Troubleshooting

- **"Firebase not initialized"**: Check your `.env.local` file
- **Authentication errors**: Verify your Firebase Auth configuration
- **Permission denied**: Check your Firestore security rules
- **Build errors**: Ensure all environment variables are set 