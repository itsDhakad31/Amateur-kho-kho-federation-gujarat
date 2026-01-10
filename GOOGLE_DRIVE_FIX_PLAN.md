# Google Drive Integration Fix Plan

## Problem Analysis

The task output shows two different Google service accounts:

| | Current Credentials | Task Error |
|---|---|---|
| **Service Account Email** | `akkfg-300@akkfg-483316.iam.gserviceaccount.com` | `akkfg-826@akkfg-482908.iam.gserviceaccount.com` |
| **Project ID** | `akkfg-483316` | `akkfg-482908` |
| **Root Folder** | ✓ PASS | - |
| **Service Account Access** | - | ✗ FAIL |
| **Upload Test** | - | ✗ FAIL (no quota) |

## Root Causes

1. **Service Account Mismatch**: The folder is expected to be shared with `akkfg-826@akkfg-482908.iam.gserviceaccount.com` but the current `credentials.json` contains `akkfg-300@akkfg-483316.iam.gserviceaccount.com`

2. **Storage Quota Issue**: Service accounts have NO storage quota. Files must be uploaded to a shared folder that uses YOUR personal Google Drive storage.

## Solution Options

### Option 1: Share Folder with Current Service Account (Recommended)
Share the root folder `1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit` with: `akkfg-300@akkfg-483316.iam.gserviceaccount.com`

### Option 2: Update credentials.json
Replace with credentials for service account: `akkfg-826@akkfg-482908.iam.gserviceaccount.com`

## Files to Edit

1. `backend/server.js` - Update service account references if needed

## Implementation Steps

### Step 1: Share the Google Drive Folder
1. Open Google Drive: https://drive.google.com/drive/folders/1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit
2. Click "Share" button
3. Add: `akkfg-300@akkfg-483316.iam.gserviceaccount.com`
4. Role: **Editor**
5. Click "Send"

### Step 2: Verify Configuration
Visit: `http://localhost:3000/debug/verify-config`

### Step 3: Test Upload
Visit: `http://localhost:3000/debug/testUpload/1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit`

## Verification Checklist

- [ ] Root folder accessible
- [ ] Service account has access (Editor role)
- [ ] Test upload successful
- [ ] Coach registration works
- [ ] Student registration works

## Notes

- Service accounts cannot have files in their own Drive - they MUST use shared folders
- The shared folder will use YOUR personal Google Drive storage quota
- All files uploaded by the service account will appear in the shared folder

