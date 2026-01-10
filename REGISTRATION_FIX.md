# Registration Fix Plan

## Issues Identified

### 1. Missing `fileUrls` Variable (CRITICAL - Line ~310)
In the coach registration handler, `fileUrls` is used but never declared:
```javascript
fileIds[field] = result.id;
fileUrls[field] = result.url;  // ❌ ReferenceError: fileUrls is not defined
```

### 2. Duplicate Supabase Client Declaration (CRITICAL - End of file)
The file imports `supabase` from `./supabase.js` at the top, then recreates it at the bottom, overwriting the module.exports:
```javascript
const supabase = require('./supabase');  // Line 1: Module import
// ... later in file ...
const supabase = createClient(...);      // Line ~500: Overwrites the import!
module.exports = supabase;               // Exports the wrong supabase
```

### 3. Supabase Upload Function Bug (Line ~100)
The upload call syntax is incorrect:
```javascript
const { data, error } = await supabase.storage
  .from(SUPABASE_BUCKET)
  upload(fileName, Buffer.from(base64Data, 'base64'), {...});  // ❌ Wrong syntax
```
Should be:
```javascript
const { data, error } = await supabase.storage
  .from(SUPABASE_BUCKET)
  .upload(fileName, Buffer.from(base64Data, 'base64'), {...});  // ✅ Has dot before upload
```

## Files to Edit
- `backend/server.js`

## Fixes Required

### Fix 1: Add missing `fileUrls` variable in coach registration handler
Add `const fileUrls = {};` before the file upload loop in `/register/coach` endpoint

### Fix 2: Remove duplicate Supabase client creation
Remove lines 495-507 that recreate the Supabase client and export it (the module.exports at the end)

### Fix 3: Add missing dot before `upload()` method call
Change `.upload(fileName, ...)` to `.upload(fileName, ...)` in the uploadFileToSupabase function

## Implementation Steps
1. [ ] Add missing `fileUrls = {}` declaration in coach registration
2. [ ] Fix Supabase upload syntax in uploadFileToSupabase function
3. [ ] Remove duplicate Supabase client code at the end of file
4. [ ] Test registration by running the server

## Verification
After applying fixes:
1. Start the server: `npm start`
2. Visit: http://localhost:3000/debug/supabase-status
3. Try coach registration: http://localhost:3000/coach-register.html
4. Check browser console for errors

