# 🚀 Nomad Tracker - Local iOS Build Guide

This guide will help you build and deploy your app to TestFlight from your Mac.

## Prerequisites

Before starting, ensure you have:

- [ ] **macOS** with Xcode 15+ installed
- [ ] **Apple Developer Account** (paid $99/year membership)
- [ ] **Node.js 18+** installed
- [ ] **Your App Store Connect API Key** (.p8 file, Key ID, and Issuer ID)

---

## Step 1: Install Required Tools

Open Terminal and run:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Verify installation
eas --version
```

---

## Step 2: Download & Extract Project

1. Download the project zip from Emergent
2. Extract to a folder on your Mac
3. Open Terminal and navigate to the frontend folder:

```bash
cd /path/to/your/project/frontend
```

---

## Step 3: Install Dependencies

```bash
# Install all dependencies
yarn install

# Or if you prefer npm
npm install
```

---

## Step 4: Login to Expo & EAS

```bash
# Login to your Expo account (create one at expo.dev if needed)
eas login

# Verify you're logged in
eas whoami
```

---

## Step 5: Configure Your App

### 5a. Update Bundle Identifier (if needed)

Edit `app.json` and ensure your bundle identifier is unique:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourname.nomadtracker"
    }
  }
}
```

### 5b. Update EAS Project ID

```bash
# This will create/link your project on Expo's servers
eas init
```

### 5c. Configure eas.json for Submission

Edit `eas.json` and update the submit section with your Apple credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

**Where to find these values:**
- **appleId**: Your Apple Developer account email
- **ascAppId**: App Store Connect → Your App → General → App Information → Apple ID
- **appleTeamId**: developer.apple.com → Account → Membership → Team ID

---

## Step 6: Build for iOS

### Option A: Cloud Build (Recommended - No Mac Required for Build)

```bash
# Build on Expo's servers
eas build --platform ios --profile production
```

This will:
1. Upload your code to Expo's build servers
2. Build the .ipa file in the cloud
3. Provide a download link when complete

### Option B: Local Build (Requires Mac with Xcode)

```bash
# Build locally on your Mac
eas build --platform ios --profile production --local
```

---

## Step 7: Submit to TestFlight

### Option A: Using EAS Submit (Automatic)

First, set up your App Store Connect API Key:

```bash
# Set up credentials
eas credentials
```

When prompted, select:
1. iOS
2. App Store Connect API Key
3. Add a new key
4. Enter your Issuer ID, Key ID, and upload your .p8 file

Then submit:

```bash
# Submit the latest build to TestFlight
eas submit --platform ios --latest
```

### Option B: Manual Upload with Transporter

1. Download the .ipa file from the build
2. Download **Transporter** from Mac App Store (free)
3. Open Transporter and sign in with your Apple ID
4. Drag and drop your .ipa file
5. Click "Deliver"

### Option C: Manual Upload with Xcode

1. Open Xcode
2. Go to **Window → Organizer**
3. Click **+** button in bottom left
4. Select your .ipa file
5. Click **Distribute App**
6. Choose **App Store Connect** → **Upload**

---

## Step 8: TestFlight Configuration

After upload completes:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **TestFlight** tab
3. Wait for Apple to process your build (5-30 minutes)
4. Once processed, the build appears in the list
5. Add yourself as an Internal Tester
6. Open TestFlight on your iPhone
7. Install and test your app!

---

## Troubleshooting

### "Missing Compliance" Warning
After upload, App Store Connect may ask about encryption. For most apps:
- Answer "No" to export compliance questions
- Your app only uses HTTPS which is exempt

### Build Fails with Signing Errors
```bash
# Reset credentials and reconfigure
eas credentials --platform ios
```

### "Bundle Identifier already exists"
Your bundle ID is taken. Change it in `app.json`:
```json
"bundleIdentifier": "com.yourname.nomadtracker2024"
```

### API Key Authentication Fails
Ensure your API Key has **Admin** or **App Manager** role in App Store Connect → Users and Access → Keys.

---

## Quick Commands Reference

```bash
# Login
eas login

# Initialize project
eas init

# Build iOS (cloud)
eas build --platform ios --profile production

# Build iOS (local)
eas build --platform ios --profile production --local

# Submit to TestFlight
eas submit --platform ios --latest

# Check build status
eas build:list

# Configure credentials
eas credentials
```

---

## Need Help?

- **Expo Documentation**: https://docs.expo.dev/build/introduction/
- **EAS Submit Guide**: https://docs.expo.dev/submit/introduction/
- **Apple Developer Forums**: https://developer.apple.com/forums/

---

Good luck with your app! 🎉
