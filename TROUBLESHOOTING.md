# Troubleshooting Guide

## Common Issues and Solutions

### 1. Season Selector Dropdown Hidden Behind Other Elements

**Problem**: The season selector dropdown appears behind other UI elements.

**Solution**: ✅ Fixed with z-index 60001
- The dropdown now appears above all other elements including the admin header
- Backdrop properly prevents interaction with background elements

### 2. Infinite Loading When Selecting Historical Seasons

**Problem**: Clicking on historical seasons causes infinite loading.

**Root Cause**: No historical seasons exist in your database yet.

**Solutions**:

#### Option A: Create Mock Season Data (For Testing)
```bash
# Test the season system with mock data
npm run season:test
```

#### Option B: Create Your First Historical Season
```bash
# Step 1: Check what happens (dry run)
npm run season:dry-run

# Step 2: Create your first season snapshot
npm run season:start
```

#### Option C: Firebase Setup Issues
If you see Firebase errors in console:

1. **Check Environment Variables**:
   ```bash
   # Copy example file
   cp .env.example .env.local
   
   # Edit .env.local with your Firebase config
   ```

2. **Required Variables**:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### 3. "No Historical Seasons Available" Message

**This is expected behavior** when:
- You haven't created any seasons yet
- This is a fresh installation
- Firebase isn't configured

**How to create seasons**:
```bash
# View all season management options
npm run season:help

# Create your first season (after adding some players and matches)
npm run season:start --season-name "Season 1: Grand Opening"
```

### 4. Console Errors

#### Firebase Auth Errors
```
Error: auth/invalid-api-key
```
**Fix**: Set up your `.env.local` file with correct Firebase credentials.

#### Season Loading Timeouts
```
Request timeout after 10 seconds
```
**Fix**: Check your internet connection and Firebase project status.

### 5. Development Server Issues

#### Port Already in Use
```bash
# Kill existing processes
pkill -f "npm run dev"

# Start fresh
npm run dev
```

#### Build Errors
```bash
# Check for TypeScript errors
npm run build

# Fix any reported issues
```

## Quick Verification Steps

### 1. Check Season System
```bash
# Test with mock data (should always work)
npm run season:test

# Check if Firebase is connected (look for errors)
# Open browser console and check for connection messages
```

### 2. Check UI Z-Index
- Open season selector dropdown
- Verify it appears above all other elements
- Try clicking outside to close (should work)

### 3. Check Current Season Display
- Should show "Current Season X" with green LIVE indicator
- Should display current player data
- Stats should update in real-time

## Expected Behavior

### First Time Setup
1. **Season Selector Shows**: "Current Season 1" only
2. **No Historical Seasons**: Normal - you need to create them
3. **Dropdown Works**: Opens/closes properly, appears on top

### After Creating Seasons
1. **Multiple Options**: Current + historical seasons appear
2. **Season Switching**: Works without page reload
3. **Historical Data**: Shows final standings and champions

## Getting Help

### Debug Information to Collect
1. Browser console logs (F12 → Console)
2. Network tab errors (F12 → Network)
3. Firebase project status
4. Node.js version: `node --version`

### Common Debug Commands
```bash
# Check what seasons exist
npm run season:list

# Test season creation (safe)
npm run season:dry-run

# Check Firebase connection
# (Look for console messages when loading the page)
```

### Still Having Issues?

1. **Check this file for updates**
2. **Clear browser cache** (Ctrl+F5)
3. **Restart development server**
4. **Verify Firebase project permissions** 