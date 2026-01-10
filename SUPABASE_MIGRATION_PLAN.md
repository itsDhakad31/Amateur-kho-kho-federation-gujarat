# Migration Plan: Google Drive → Supabase Storage

## Overview
Replace Google Drive API with Supabase for file storage (photographs, documents, ID cards).

## Supabase Setup

### 1. Create Supabase Project
1. Go to: https://supabase.com
2. Sign up/Login
3. Create new project: "AKKFG"
4. Note these credentials:
   - **URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `public-anon-key`
   - **Service Role Key**: `secret-service-role-key` (keep secure!)

### 2. Create Storage Bucket
In Supabase Dashboard:
1. Go to **Storage** → **New Bucket**
2. Name: `akkfg-files`
3. Make **Public**: YES
4. Save

### 3. Configure Row Level Security (RLS)
Run these SQL queries in Supabase SQL Editor:

```sql
-- Create storage bucket (if not created via UI)
INSERT INTO storage.buckets (id, name, public) VALUES ('akkfg-files', 'akkfg-files', true);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access to files
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING ( bucket_id = 'akkfg-files' );

-- Create policy to allow authenticated uploads
CREATE POLICY "Authenticated Uploads" ON storage.objects
  FOR INSERT
  WITH CHECK ( bucket_id = 'akkfg-files' AND auth.role() = 'authenticated' );
```

## Files to Create/Edit

### New Files
- `backend/supabase.js` - Supabase client configuration

### Files to Edit
- `backend/server.js` - Replace Drive API calls with Supabase Storage
- `.env` - Add Supabase credentials
- `package.json` - Add `@supabase/supabase-js` dependency

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Client (`backend/supabase.js`)
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### Step 3: Update `backend/server.js`
Replace Google Drive upload function with Supabase:

```javascript
const supabase = require('./supabase');

async function uploadFileToSupabase(file, folderPath) {
  const timestamp = Date.now();
  const fileName = `${folderPath}/${timestamp}-${file.originalname}`;
  
  // Convert buffer to base64 for Supabase
  const base64Data = file.buffer.toString('base64');
  
  const { data, error } = await supabase.storage
    .from('akkfg-files')
    .upload(fileName, Buffer.from(base64Data, 'base64'), {
      contentType: file.mimetype,
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('akkfg-files')
    .getPublicUrl(fileName);
  
  return {
    id: data.path,
    name: fileName,
    url: urlData.publicUrl
  };
}
```

## Environment Variables

Create `.env` file in `backend/`:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep these for local development (add to .gitignore)
# Remove Google Drive credentials if no longer needed
```

## Testing Checklist

- [ ] Supabase project created
- [ ] Storage bucket `akkfg-files` created and public
- [ ] RLS policies configured
- [ ] Dependencies installed
- [ ] Server starts without errors
- [ ] Coach registration uploads files
- [ ] Student registration uploads files
- [ ] Files appear in Supabase Storage dashboard
- [ ] Photo retrieval works

## Migration Benefits

| Feature | Google Drive | Supabase |
|---------|--------------|----------|
| Setup | Complex (service accounts) | Simple |
| Authentication | Service account | API keys |
| Storage Quota | Shared with personal Drive | Project-based |
| API | Complex REST | Simple SDK |
| Cost | Free | Generous free tier |

## Rollback Plan

If needed, keep the Google Drive code commented out:
```javascript
// const { google } = require('googleapis');
// const drive = google.drive({ version: 'v3', auth });
```

## Estimated Time
- Setup: 15 minutes
- Implementation: 30 minutes
- Testing: 15 minutes
- **Total: ~1 hour**

