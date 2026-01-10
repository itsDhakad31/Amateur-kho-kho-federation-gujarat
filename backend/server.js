// Load environment variables from .env file (in the same directory as server.js)
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Multer for file uploads - using memory storage for direct Supabase upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Persistent user storage (simple JSON file database)
const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Could not load users file, starting fresh:', err.message);
  }
  return {};
}

function saveUsers(usersData) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
  } catch (err) {
    console.error('Failed to save users file:', err.message);
  }
}

// Load users from persistent storage on startup
const users = loadUsers();

// Simple file logger for debugging uploads
function appendLog(msg) {
  try {
    fs.appendFileSync(path.join(__dirname, 'upload-debug.log'), `${new Date().toISOString()} ${msg}\n`);
  } catch (e) {
    console.error('Failed to write debug log', e);
  }
}

// ========================================================================
// SUPABASE STORAGE CONFIGURATION
// ========================================================================
//
// Using Supabase for file storage instead of Google Drive
// Supabase provides generous free tier and simple API
//
// SETUP:
// 1. Create project at https://supabase.com
// 2. Create bucket named 'akkfg-files' and make it public
// 3. Set environment variables:
//    - SUPABASE_URL=your-project-url
//    - SUPABASE_ANON_KEY=your-anon-key
//
// BUCKET STRUCTURE:
// - akkfg-files/
//   ├── students/{studentName}/
//   │   ├── photograph.{ext}
//   │   ├── aadhar.{ext}
//   │   ├── pan.{ext}
//   │   ├── birthCertificate.{ext}
//   │   ├── coachingCertificate.{ext}
//   │   └── refereeCertificate.{ext}
//   └── coaches/{coachName}/
//       ├── photograph.{ext}
//       ├── aadhar.{ext}
//       ├── pan.{ext}
//       └── birthCertificate.{ext}
// ========================================================================

// Supabase configuration
const SUPABASE_BUCKET = 'akkfg-files';

// Helper: Sanitize name for use in folder path
function sanitizeName(name) {
  if (!name) return 'unknown';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .substring(0, 50);            // Limit length
}

// Helper: Upload file to Supabase Storage
async function uploadFileToSupabase(file, folderPath) {
  // Get file extension from original name
  const ext = file.originalname.split('.').pop() || 'jpg';
  
  // Use the field name as the file name (e.g., photograph, aadhar, pan, etc.)
  const fileName = `${folderPath}/${file.fieldname}.${ext}`;
  
  console.log(`[UPLOAD DEBUG] Uploading to Supabase: ${fileName}`);
  console.log(`[UPLOAD DEBUG] File size: ${file.buffer?.length || 'unknown'} bytes`);
  console.log(`[UPLOAD DEBUG] MIME type: ${file.mimetype}`);
  
  // Convert buffer to base64 for Supabase upload
  const base64Data = file.buffer.toString('base64');
  
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(fileName, Buffer.from(base64Data, 'base64'), {
      contentType: file.mimetype,
      upsert: false,
      cacheControl: '31536000' // 1 year cache
    });
  
  if (error) {
    console.error('[UPLOAD DEBUG] Supabase upload error:', error);
    throw error;
  }
  
  console.log('[UPLOAD DEBUG] Upload successful:', data.path);
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(fileName);
  
  return {
    id: data.path,
    name: fileName,
    url: urlData.publicUrl
  };
}

// Helper: Get file from Supabase Storage
async function getFileFromSupabase(filePath) {
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .download(filePath);
  
  if (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
  
  return data;
}

// Helper: Get public URL for a file
function getFileUrl(filePath) {
  const { data } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

// Helper: get next folder name with counter
async function getNextFolderName(type) {
  const counterFile = path.join(__dirname, `${type}_counter.txt`);
  let counter = 1;
  try {
    if (fs.existsSync(counterFile)) {
      counter = parseInt(fs.readFileSync(counterFile, 'utf8').trim()) + 1;
    }
  } catch (err) {
    console.warn('Error reading counter file, starting from 1:', err);
  }
  try {
    fs.writeFileSync(counterFile, counter.toString());
  } catch (err) {
    console.error('Error writing counter file:', err);
  }
  return `akkfg${counter}`;
}

// ---- Debug endpoints ----

// Debug: return Supabase configuration status
app.get('/debug/supabase-status', (req, res) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  
  res.json({
    success: !!(url && key),
    configured: !!url && !!key,
    url: url ? '✓ Configured' : '✗ Not set',
    key: key ? '✓ Configured' : '✗ Not set',
    bucket: SUPABASE_BUCKET
  });
});

// Debug: perform a test upload
app.get('/debug/testUpload', async (req, res) => {
  try {
    const timestamp = Date.now();
    const testContent = `Test upload at ${new Date().toISOString()}`;
    const fileName = `debug/test-${timestamp}.txt`;
    
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(fileName, Buffer.from(testContent), {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(fileName);
    
    res.json({
      success: true,
      file: {
        path: data.path,
        url: urlData.publicUrl
      }
    });
  } catch (err) {
    console.error('debug testUpload error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Debug: list files in a folder (removed - not compatible with Express 5)

// Debug: verify Supabase configuration
app.get('/debug/verify-config', async (req, res) => {
  const results = {
    success: true,
    checks: [],
    storage: {
      bucket: SUPABASE_BUCKET,
      configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
    }
  };

  // Check 1: Supabase credentials
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  
  if (url && key) {
    results.checks.push({
      name: 'Supabase credentials configured',
      status: '✓ PASS',
      details: { url: url.substring(0, 30) + '...' }
    });
  } else {
    results.checks.push({
      name: 'Supabase credentials configured',
      status: '✗ FAIL',
      details: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY',
      action: {
        step1: 'Set SUPABASE_URL environment variable',
        step2: 'Set SUPABASE_ANON_KEY environment variable'
      }
    });
    results.success = false;
  }

  // Check 2: Bucket exists and is accessible
  try {
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket(SUPABASE_BUCKET);
    
    if (bucketError && !bucketData) {
      // Bucket might not exist, try to create it
      const { data: createData, error: createError } = await supabase
        .storage
        .createBucket(SUPABASE_BUCKET, { public: true });
      
      if (createError) {
        throw createError;
      }
      
      results.checks.push({
        name: 'Storage bucket',
        status: '✓ PASS (created)',
        details: { name: SUPABASE_BUCKET, public: true }
      });
    } else {
      results.checks.push({
        name: 'Storage bucket accessible',
        status: '✓ PASS',
        details: { name: SUPABASE_BUCKET }
      });
    }
  } catch (err) {
    results.checks.push({
      name: 'Storage bucket accessible',
      status: '✗ FAIL',
      details: err.message,
      action: {
        step1: 'Create bucket named: ' + SUPABASE_BUCKET,
        step2: 'Make bucket public',
        step3: 'Configure RLS policies if needed'
      }
    });
    results.success = false;
  }

  // Check 3: Test upload capability
  if (results.success) {
    try {
      const timestamp = Date.now();
      const testFile = `debug/config-test-${timestamp}.txt`;
      const testContent = `Supabase test upload at ${new Date().toISOString()}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(testFile, Buffer.from(testContent), {
          contentType: 'text/plain',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(testFile);
      
      results.checks.push({
        name: 'Test upload',
        status: '✓ PASS',
        details: {
          filePath: uploadData.path,
          url: urlData.publicUrl
        },
        note: 'Supabase Storage is working correctly!'
      });
      
      // Clean up test file
      await supabase.storage.from(SUPABASE_BUCKET).remove([testFile]);
    } catch (err) {
      results.checks.push({
        name: 'Test upload',
        status: '✗ FAIL',
        details: err.message,
        hint: 'Check bucket permissions and RLS policies'
      });
      results.success = false;
    }
  }

  res.json(results);
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Registration routes
app.post('/register/coach', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'birthCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, dob, city, country, gender, email, mobile, experience, terms } = req.body;
    const uniqueId = uuidv4();
    const folderName = sanitizeName(name);

    // Upload files to Supabase Storage
    const fileIds = {};
    const fileUrls = {};
    let lastSupabaseError = null;

    try {
      console.log('Coach upload: req.files keys =', Object.keys(req.files || {}));
      appendLog('Coach upload: req.files keys = ' + JSON.stringify(Object.keys(req.files || {})));

      // Upload all files using Supabase to coaches/{name}/
      for (const field in req.files) {
        const file = req.files[field][0];
        const result = await uploadFileToSupabase(file, `coaches/${folderName}`);
        console.log('Uploaded file to Supabase:', result);
        fileIds[field] = result.id;
        fileUrls[field] = result.url;
        appendLog(`Uploaded ${field} to Supabase path=${result.id}`);
      }
    } catch (supabaseError) {
      console.error('Supabase upload failed:', supabaseError);
      appendLog('Supabase upload failed: ' + (supabaseError.message || String(supabaseError)));
      lastSupabaseError = supabaseError;
      // Still proceed with registration
    }

    // Store user data in persistent storage
    users[uniqueId] = {
      id: uniqueId,
      type: 'coach',
      name,
      dob,
      gender,
      city,
      country,
      email,
      mobile,
      photo: fileIds.photograph || null,
      photoUrl: fileUrls.photograph || null,
      folderName: folderName,
      fileIds: fileIds,
      fileUrls: fileUrls,
      createdAt: new Date().toISOString()
    };

    // Save to persistent storage
    saveUsers(users);

    console.log('Coach registered:', { uniqueId, folderName, name, email, fileIds });

    // Always return JSON since frontend uses fetch/AJAX
    const resp = { success: true, uniqueId, folderName, fileIds, redirectUrl: `/idcard/${uniqueId}` };
    if (lastSupabaseError) resp.supabaseError = (lastSupabaseError.message || String(lastSupabaseError));
    return res.json(resp);
  } catch (error) {
    console.error('Coach registration error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

app.post('/register/student', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'birthCertificate', maxCount: 1 },
  { name: 'coachingCertificate', maxCount: 1 },
  { name: 'refereeCertificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, dob, city, country, gender, email, mobile, experience, level, year, education, terms } = req.body;
    const uniqueId = uuidv4();
    const folderName = sanitizeName(name);

    // Upload files to Supabase Storage
    const fileIds = {};
    const fileUrls = {};
    let lastSupabaseError = null;

    try {
      console.log('Student upload: req.files keys =', Object.keys(req.files || {}));
      appendLog('Student upload: req.files keys = ' + JSON.stringify(Object.keys(req.files || {})));

      // Upload all files using Supabase to students/{name}/
      for (const field in req.files) {
        const file = req.files[field][0];
        const result = await uploadFileToSupabase(file, `students/${folderName}`);
        console.log('Uploaded file to Supabase:', result);
        fileIds[field] = result.id;
        fileUrls[field] = result.url;
        appendLog(`Uploaded ${field} to Supabase path=${result.id}`);
      }
    } catch (supabaseError) {
      console.error('Supabase upload failed:', supabaseError);
      appendLog('Supabase upload failed: ' + (supabaseError.message || String(supabaseError)));
      lastSupabaseError = supabaseError;
      // Still proceed with registration
    }

    // Store user data in persistent storage
    users[uniqueId] = {
      id: uniqueId,
      type: 'student',
      name,
      dob,
      gender,
      city,
      country,
      email,
      mobile,
      level,
      year,
      education,
      photo: fileIds.photograph || null,
      photoUrl: fileUrls.photograph || null,
      folderName: folderName,
      fileIds: fileIds,
      fileUrls: fileUrls,
      createdAt: new Date().toISOString()
    };

    // Save to persistent storage
    saveUsers(users);

    console.log('Student registered:', { uniqueId, folderName, name, email, fileIds });

    // Always return JSON since frontend uses fetch/AJAX
    const resp = { success: true, uniqueId, folderName, fileIds, redirectUrl: `/idcard/${uniqueId}` };
    if (lastSupabaseError) resp.supabaseError = (lastSupabaseError.message || String(lastSupabaseError));
    return res.json(resp);
  } catch (error) {
    console.error('Student registration error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Login route
app.post('/login', (req, res) => {
  const { uniqueId } = req.body;
  if (!uniqueId || uniqueId.trim() === '') {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Error - AKKFG</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <main style="text-align: center; padding: 60px 20px;">
          <h2 style="color: #D32F2F;">❌ Invalid ID</h2>
          <p>Please provide a valid Unique ID.</p>
          <a href="/login.html" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">Back to Login</a>
        </main>
      </body>
      </html>
    `);
  }
  res.redirect(`/idcard/${uniqueId}`);
});

// Serve photo from Supabase Storage
app.get('/photo/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    if (!fileId || fileId === 'null' || fileId === 'undefined') {
      return res.redirect('https://via.placeholder.com/90x110/cccccc/666666?text=No+Photo');
    }

    // Get file from Supabase Storage
    const fileData = await getFileFromSupabase(fileId);
    
    // Determine content type from file extension or default to image/jpeg
    let contentType = 'image/jpeg';
    if (fileId.includes('.png')) contentType = 'image/png';
    else if (fileId.includes('.gif')) contentType = 'image/gif';
    else if (fileId.includes('.pdf')) contentType = 'application/pdf';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Convert ArrayBuffer to Buffer and send
    const buffer = Buffer.from(await fileData.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.redirect('https://via.placeholder.com/90x110/cccccc/666666?text=Photo+Error');
  }
});

// Handle /idcard/ without ID - redirect to login
app.get('/idcard', (req, res) => {
  res.redirect('/login.html');
});

app.get('/idcard/', (req, res) => {
  res.redirect('/login.html');
});

// ID Card route
app.get('/idcard/:id', (req, res) => {
  const user = users[req.params.id];
  
  // Default values if user not found
  const userData = user || {
    id: req.params.id,
    type: 'member',
    name: 'Unknown',
    dob: 'N/A',
    gender: 'N/A',
    photo: null,
    photoUrl: null
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Determine card type label
  const typeLabel = userData.type === 'coach' ? 'COACH' : 'STUDENT';

  // Get photo URL (Supabase URL or from fileIds)
  const photoId = userData.photo;
  const photoUrl = userData.photoUrl || (photoId ? getFileUrl(photoId) : null);

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ID Card - ${userData.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background: #f2f2f2;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .id-card {
      width: 340px;
      min-height: 210px;
      background: #ffffff;
      border-radius: 8px;
      border: 2px solid #003366;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      padding: 12px 16px;
      margin: 20px auto;
    }

    .id-header {
      text-align: center;
      border-bottom: 1px solid #ccc;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .id-header h2 {
      font-size: 14px;
      margin: 0;
      color: #003366;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .id-header p {
      font-size: 9px;
      margin: 2px 0 0;
      color: #333;
    }

    .id-body {
      display: flex;
      gap: 10px;
    }

    .id-photo {
      width: 90px;
      height: 110px;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #f5f5f5;
    }

    .id-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .id-photo .placeholder {
      font-size: 10px;
      color: #999;
      text-align: center;
      padding: 5px;
    }

    .id-info {
      flex: 1;
    }

    .id-type {
      background: #003366;
      color: white;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 3px;
      display: inline-block;
      margin-bottom: 4px;
    }

    .id-info h3 {
      font-size: 13px;
      margin: 0 0 4px;
      text-transform: uppercase;
      color: #003366;
    }

    .id-info p {
      font-size: 10px;
      margin: 2px 0;
      color: #333;
    }

    .id-info strong {
      color: #003366;
    }

    .id-footer {
      margin-top: 8px;
      border-top: 1px solid #ccc;
      padding-top: 6px;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 4px;
    }

    .signature-block {
      text-align: center;
      flex: 1;
    }

    .sign-line {
      border-bottom: 1px solid #333;
      width: 100px;
      margin: 0 auto 2px;
    }

    .signatures span {
      font-size: 9px;
      text-transform: uppercase;
      color: #333;
    }

    .id-note {
      font-size: 8px;
      line-height: 1.2;
      color: #666;
      text-align: center;
      margin-top: 6px;
    }

    .uid-line {
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .uid-line strong { color: #003366; font-size: 11px; }
    .uid-value {
      font-family: "Courier New", monospace;
      background: #f3f6fb;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 700;
      letter-spacing: 1px;
      font-size: 13px;
      color: #002244;
    }

    .back-link {
      margin-top: 20px;
      text-align: center;
    }

    .back-link a {
      color: #003366;
      text-decoration: none;
      font-size: 14px;
    }

    .back-link a:hover {
      text-decoration: underline;
    }

    .print-btn {
      margin-top: 15px;
      padding: 10px 25px;
      background: #003366;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }

    .print-btn:hover {
      background: #002244;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .back-link, .print-btn {
        display: none;
      }
      .id-card {
        box-shadow: none;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="id-card">
    <div class="id-header">
      <h2>Amateur Kho Kho Federation Gujarat</h2>
      <p>B-1, Basement, Dhawandeep Building, 6, Jantar Mantar Road, New Delhi-110001.</p>
    </div>

    <div class="id-body">
      <div class="id-photo">
        ${photoUrl ? `<img src="${photoUrl}" alt="${userData.name}" crossorigin="anonymous" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'>PHOTO<br>UNAVAILABLE</div>'">` : '<div class="placeholder">PHOTO</div>'}
      </div>
      <div class="id-info">
        <span class="id-type">${typeLabel}</span>
        <h3 id="player-name">${userData.name}</h3>
        <p class="uid-line"><strong>UID:</strong> <span id="uid-text" class="uid-value">${userData.id}</span></p>
        <p><strong>D.O.B:</strong> <span id="dob-text">${formatDate(userData.dob)}</span></p>
        <p><strong>GENDER:</strong> <span id="gender-text">${(userData.gender || 'N/A').toUpperCase()}</span></p>
        ${userData.level ? `<p><strong>LEVEL:</strong> ${userData.level}</p>` : ''}
      </div>
    </div>

    <div class="id-footer">
      <div class="signatures">
        <div class="signature-block">
          <div class="sign-line"></div>
          <span>PRESIDENT SIGNATURE</span>
        </div>
        <div class="signature-block">
          <div class="sign-line"></div>
          <span>GENERAL SECRETARY SIGNATURE</span>
        </div>
      </div>
      <p class="id-note">
        This card is the property of the Federation and may be deactivated at any time.
      </p>
    </div>
  </div>

  <div class="back-link">
    <a href="/">Back to Home</a>
  </div>
  <button class="print-btn" onclick="window.print()">Print ID Card</button>
</body>
</html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase Storage: ${process.env.SUPABASE_URL ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`Bucket: ${SUPABASE_BUCKET}`);
});

