# TODO: Fix Google Drive Service Account Access

## Goal
Share the Google Drive folder with the service account so uploads work properly.

## Manual Action Required (Not Automated)

**You must do this manually in Google Drive:**

1. Open the folder: https://drive.google.com/drive/folders/1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit
2. Click the **"Share"** button (top right)
3. Under "Add people and groups":
   - Email: `akkfg-300@akkfg-483316.iam.gserviceaccount.com`
   - Role: **Editor**
4. Click **"Send"**

## After Sharing

### Step 1: Verify Configuration
Visit in your browser:
```
http://localhost:3000/debug/verify-config
```

Expected result:
```json
{
  "success": true,
  "checks": [
    {"name": "Root folder accessible", "status": "✓ PASS"},
    {"name": "Service account has access", "status": "✓ PASS"}
  ]
}
```

### Step 2: Test Upload
Visit:
```
http://localhost:3000/debug/testUpload/1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit
```

Expected result:
```json
{
  "success": true,
  "file": { "id": "...", "name": "debug-upload-*.txt" }
}
```

## Files Already Correct
- ✅ `backend/credentials.json` - Has correct service account email
- ✅ `backend/server.js` - Has correct folder ID and service account references

## Current Service Account Details
| Property | Value |
|----------|-------|
| Email | `akkfg-300@akkfg-483316.iam.gserviceaccount.com` |
| Project ID | `akkfg-483316` |
| Root Folder ID | `1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit` |

## If Verification Fails

Check these common issues:
1. **"Root folder not accessible"** - Folder ID is wrong or folder was deleted
2. **"Service account does NOT have access"** - You didn't share the folder properly
3. **"Permission denied"** - Service account needs Editor role, not Viewer

## Testing After Fix

1. Register a coach: http://localhost:3000/coach-register.html
2. Register a student: http://localhost:3000/student-register.html
3. Check Google Drive folder for uploaded files

