# Tender Document Package Builder

## Participant
- Name: Labanya Biswas
- Registration Number: labanya

## Live Site
https://labanya352.github.io/devfest-labanya/

## Run Locally
1. Open this project folder.
2. Run:
   `python3 -m http.server 5500`
3. Open:
   `http://localhost:5500`

## Main Features
- Load tender requirements from requirements.json
- Upload multiple PDF files
- PDF page counting
- Reject invalid/non-PDF files
- Remove uploaded files
- Match one PDF to one required document
- Expiry-date validation against submission deadline
- Statuses: Missing, Expiry date needed, Expired, Not provided, OK
- Exact duplicate detection using SHA-256
- Prevent duplicate-content files from being matched to different requirements
- Generate ordered combined PDF package
- English cover page
- Footer on every page with tender ID and Page X of Y
- English/Bangla interface
- Browser-side processing only

## Bonus Features
- CSV checklist export
- Duplicate-content hash display

## Known Problems
- Bangla text is not embedded in the generated PDF cover.
- Matching is manual.

## AI Tools Used
- ChatGPT

## Most Useful Prompt
"Create a frontend-only Tender Document Package Builder with JSON loading, PDF upload, duplicate detection, matching, expiry status checks, bilingual UI and PDF generation."

## Tech
- HTML
- CSS
- JavaScript
- pdf-lib
- PDF.js

## Privacy
All document processing happens inside the browser. No tender PDF is uploaded to a server.
