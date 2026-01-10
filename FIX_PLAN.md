# Fix Plan for Google Drive Integration Issues

## Issues Identified

### 1. Service Account Email Mismatch (CRITICAL)
- **Code references**: `akkfg-300@akkfg-483316.iam.gserviceaccount.com`
- **Actual credentials**: `akkfg-300@akkfg-483316.iam.gserviceaccount.com`
- **Impact**: Authentication will fail because the service account email doesn't match the credentials

### 2. Upload Stream Error
- **Error**: `part.body.pipe is not a function`
- **Root Cause**: The `bufferToStream` function is defined but not used properly
- **Issue**: When uploading from memory storage, `file.buffer` is a Buffer but the Drive API expects a proper stream

### 3. Root Folder Not Accessible
- **Error**: `Root folder not accessible. Check configuration.`
- **Cause**: Multiple issues including service account mismatch and folder sharing

## Files to Edit
- `backend/server.js` - Multiple fixes needed

## Fixes Required

### Fix 1: Update Service Account Email References
Search and replace all occurrences of:
- `akkfg-300@akkfg-483316.iam.gserviceaccount.com` → `akkfg-300@akkfg-483316.iam.gserviceaccount.com`
- Project ID: `akkfg-482908` → `akkfg-483316`

### Fix 2: Fix Stream Handling in uploadFileToDrive
The `bufferToStream` function is defined at line 28-31 but not used. Need to use it when handling Buffer data:
```javascript
// When using Buffer from memory storage, wrap it with bufferToStream
if (file.buffer && Buffer.isBuffer(file.buffer)) {
  media.body = bufferToStream(file.buffer);  // FIX: Wrap buffer in proper stream
  console.log(`[UPLOAD DEBUG] Using bufferToStream for memory storage, size: ${file.buffer.length}`);
}
```

### Fix 3: Improve Error Messages
Update the error message in `ensureDriveFolders` to provide clearer troubleshooting steps

## Implementation Steps

1. [ ] Replace all service account email references in server.js
2. [ ] Fix stream handling in uploadFileToDrive function to use bufferToStream
3. [ ] Update error messages for better debugging
4. [ ] Test the fixes

## Verification
After applying fixes, access: `http://localhost:3000/debug/verify-config` to verify the configuration works correctly.

