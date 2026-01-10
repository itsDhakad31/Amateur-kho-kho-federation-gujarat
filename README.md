# Amateur Kho Kho Federation Gujarat

A simple website clone for the Amateur Kho Kho Federation Gujarat.

## Features

- Front page with logo, notices, social media, date, and profile links
- Side pages: Events, Results, Locators, Contact
- Registration for Coaches and Students with document upload
- Unique ID generation and ID card display
- Basic login to view ID card
- Documents stored in Google Drive

## Setup

1. Install dependencies: `npm install`
2. Set up Google Drive API:
   - Create a Google Cloud project
   - Enable Google Drive API
   - Create credentials (service account key)
   - Download `credentials.json` and place in `backend/` folder
   - Create a folder in Google Drive and note its ID, replace `YOUR_GOOGLE_DRIVE_FOLDER_ID` in `server.js`
3. Start the server: `npm start`
4. Open `http://localhost:3000`

## Note

This is a minimal implementation. For production, add proper authentication, database, error handling, etc.