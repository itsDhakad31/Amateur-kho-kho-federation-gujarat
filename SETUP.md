# Google Drive Setup Guide for AKKFG Backend

## Problem: Service Account Storage Quota

**Service accounts have ZERO storage quota on their own Google Drive.**

This means if you try to upload files directly using a service account without a shared folder, Google will reject the upload with a quota error.

## Solution: Use Your Personal Google Drive Folder

The solution is to create a folder in YOUR personal Google Drive and share it with the service account. This way, uploads will use YOUR storage quota instead of the service account's (non-existent) quota.

---

## Step-by-Step Setup

### 1. Create the Root Folder in Your Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Click "New" → "New folder"
3. Name it: `AKKFG_DATABASE` (or any name you prefer)
4. Click "Create"

### 2. Get the Folder ID

1. Right-click the folder → "Share"
2. Click "Copy link"
3. The folder ID is the part after `/folders/` in the URL:
   
   ```
   https://drive.google.com/drive/folders/1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit
                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                   This is your FOLDER ID
   ```

4. Copy this ID - you'll need it for the configuration

### 3. Share the Folder with the Service Account

1. Right-click the folder → "Share"
2. Under "Add people and groups", paste the service account email:

   ```
   akkfg-300@akkfg-483316.iam.gserviceaccount.com
   ```

3. Set Role to: **Editor**
4. Click "Send" or "Done"

### 4. Configure the Backend

The folder ID has been configured in `backend/server.js`:

```javascript
const DRIVE_ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID || '1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit';
```

You can also use environment variables:
```bash
export DRIVE_ROOT_FOLDER_ID=your_folder_id_here
```

### 5. Restart the Server

```bash
# Stop the server (Ctrl+C if running)
# Then restart:
npm start
```

---

## Verification

### Method 1: Use the Verification Endpoint

Visit this URL in your browser:

```
http://localhost:3000/debug/verify-config
```

This will check:
- ✓ Root folder is accessible
- ✓ Service account has proper permissions
- ✓ Coach/Student subfolders exist
- ✓ Test upload works

### Method 2: Quick Test Upload

```
http://localhost:3000/debug/testUpload/1GszG7AZRvs1oUwBPU2Q2lRNeTvIytwit
```

If successful, you'll see a JSON response with the uploaded file details.

### Method 3: Check in Google Drive

1. Open your `AKKFG_DATABASE` folder in Google Drive
2. Look for a file named `config-test-*.txt` (from the verification test)
3. You should also see `coach` and `student` subfolders

---

## Expected Folder Structure

After successful setup, your Google Drive should look like:

```
My Drive/
└── AKKFG_DATABASE/           ← Shared with service account (Editor)
    ├── config-test-*.txt     ← Test file from verification
    ├── coach/                ← Coach registrations
    │   └── akkfg1/           ← Individual coach folder
    │       ├── photo.jpg
    │       ├── aadhar.pdf
    │       └── ...
    └── student/              ← Student registrations
        └── akkfg1/           ← Individual student folder
            ├── photo.jpg
            ├── aadhar.pdf
            └── ...
```

---

## Troubleshooting

### "Root folder not accessible" Error

1. **Check folder ID**: Verify the ID is correct in `server.js`
2. **Check folder exists**: Ensure the folder is in your Google Drive
3. **Check sharing**: Verify the folder is shared with the service account

### "Permission denied" on Upload

1. Open the folder in Google Drive
2. Right-click → "Share"
3. Ensure the service account email has "Editor" access
4. Click "Save"

### Files Not Appearing

1. Run the verification endpoint: `http://localhost:3000/debug/verify-config`
2. Check console logs for error messages
3. Ensure subfolders (`coach`, `student`) have been created

---

## Important Notes

### ✓ DO:
- Use a folder from your personal Google Drive
- Share the folder with the service account as Editor
- Always upload files with `parents: [folderId]` specified
- Test with the `/debug/verify-config` endpoint

### ✗ DON'T:
- Let the service account create root folders
- Upload files without specifying parents
- Use the service account's own Drive
- Skip the sharing step

---

## Service Account Details

| Property | Value |
|----------|-------|
| Email | `akkfg-300@akkfg-483316.iam.gserviceaccount.com` |
| Project ID | `akkfg-482908` |
| Client ID | `111527432688475100864` |

---

## Environment Variables

You can override the folder ID using environment variables:

```bash
# Root folder (required)
export DRIVE_ROOT_FOLDER_ID=your_folder_id

# Optional: specific subfolder IDs (will be created if not provided)
export DRIVE_COACH_ID=your_coach_folder_id
export DRIVE_STUDENT_ID=your_student_folder_id
```

Or create a `.env` file in the `backend` directory:

```env
DRIVE_ROOT_FOLDER_ID=your_folder_id
DRIVE_COACH_ID=
DRIVE_STUDENT_ID=
```

---

## Testing Registration

After setup is complete:

1. **Coach Registration**: http://localhost:3000/coach-register.html
2. **Student Registration**: http://localhost:3000/student-register.html
3. **Check Files**: Verify files appear in your Google Drive folder

