# CuraX Website — Complete Deployment Guide
## curax.life | GitHub Pages + Google Sheets Backend

---

## OVERVIEW

This guide walks you through:
1. Setting up Google Sheets + Apps Script backend
2. Deploying to GitHub Pages
3. Connecting your curax.life domain
4. Testing the full end-to-end flow

**Zero backend cost. Everything runs on Google's free infrastructure.**

---

## STEP 1 — GOOGLE SHEETS SETUP

### 1.1 Create the Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **CuraX Leads**
4. The Apps Script will automatically create the "CuraX Leads" sheet tab with headers on first submission

### 1.2 Add the Apps Script

1. In Google Sheets, click: **Extensions → Apps Script**
2. A new Apps Script editor opens
3. **Delete all existing code** in the editor
4. Copy the entire contents of `backend/apps-script.gs`
5. Paste it into the editor
6. Click the **Save** icon (or Ctrl+S / Cmd+S)
7. Name the project: `CuraX Backend`

### 1.3 Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose: **Web app**
4. Fill in settings:
   - **Description**: CuraX Lead Capture v1.0
   - **Execute as**: Me (your Google account)
   - **Who has access**: **Anyone** ← This is critical!
5. Click **Deploy**
6. Click **Authorize access** → Choose your Google account → Allow
7. **COPY THE WEB APP URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.....LONG_STRING..../exec
   ```
   ⚠️ Save this URL — you will need it in the next step.

### 1.4 Connect URL to Website

1. Open `script.js` in the curax-website folder
2. Find line 11:
   ```javascript
   const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
   ```
3. Replace with your actual URL:
   ```javascript
   const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec";
   ```
4. Save the file

### 1.5 Test the Backend

1. Open your Web App URL in a browser
2. You should see this JSON response:
   ```json
   {"status":"ok","message":"CuraX backend is running..."}
   ```
3. In Apps Script editor, run the `testManualSubmit()` function
4. Check your Google Sheet — a test row should appear

---

## STEP 2 — GITHUB REPOSITORY SETUP

### 2.1 Create GitHub Account (if needed)

Go to [github.com](https://github.com) and sign up for a free account.

### 2.2 Create a New Repository

1. Click the **+** button → **New repository**
2. Settings:
   - **Repository name**: `curax-website`
   - **Visibility**: Public ← Required for free GitHub Pages
   - Do NOT initialize with README (you'll upload your files)
3. Click **Create repository**

### 2.3 Upload Your Files

**Option A — GitHub Web Interface (Easiest):**
1. On your new empty repo page, click **uploading an existing file**
2. Drag and drop your entire `curax-website/` folder contents
3. Important: Upload files maintaining the folder structure:
   ```
   index.html
   partner.html
   styles.css
   script.js
   forms/clinic-form.html
   forms/hospital-form.html
   forms/diagnostic-form.html
   forms/veterinary-form.html
   assets/  (folder)
   backend/apps-script.gs
   ```
4. Add commit message: `Initial CuraX website deployment`
5. Click **Commit changes**

**Option B — Git Command Line:**
```bash
# Navigate to your curax-website folder
cd curax-website

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial CuraX website deployment"

# Connect to GitHub (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/curax-website.git

# Push to GitHub
git push -u origin main
```

### 2.4 Enable GitHub Pages

1. In your repository, click **Settings** (top tab)
2. Scroll down to **Pages** (left sidebar)
3. Under **Source**, select: **Deploy from a branch**
4. **Branch**: `main` | **Folder**: `/ (root)`
5. Click **Save**
6. Wait 2–5 minutes
7. Your site will be live at:
   ```
   https://USERNAME.github.io/curax-website/
   ```
8. Test this URL first before connecting your domain!

---

## STEP 3 — CONNECT curax.life DOMAIN

### 3.1 Add Custom Domain in GitHub Pages

1. In your repo → **Settings → Pages**
2. Under **Custom domain**, type: `curax.life`
3. Click **Save**
4. GitHub will check for DNS records (might show error until DNS is configured)

### 3.2 Configure DNS Records

Log into your domain registrar (where you bought curax.life) and add these DNS records:

**A Records — for apex domain (curax.life):**
```
Type: A    Name: @    Value: 185.199.108.153    TTL: 3600
Type: A    Name: @    Value: 185.199.109.153    TTL: 3600
Type: A    Name: @    Value: 185.199.110.153    TTL: 3600
Type: A    Name: @    Value: 185.199.111.153    TTL: 3600
```

**CNAME Record — for www subdomain:**
```
Type: CNAME    Name: www    Value: USERNAME.github.io.    TTL: 3600
```
Replace `USERNAME` with your actual GitHub username.

**⏰ DNS Propagation:** It takes 15 minutes to 48 hours for DNS to propagate globally. Usually within 1–2 hours in India.

### 3.3 Enable HTTPS (Free SSL)

1. Wait for DNS to propagate (check at [dnschecker.org](https://dnschecker.org))
2. Go to your repo → **Settings → Pages**
3. Once DNS is verified, you'll see: **"Enforce HTTPS"** checkbox
4. Check the box ✅ — This enables free SSL via Let's Encrypt
5. Your site will be available at **https://curax.life**

---

## STEP 4 — VERIFY DEPLOYMENT

### Full Testing Checklist

**Website:**
- [ ] https://curax.life loads correctly
- [ ] https://www.curax.life redirects to main site
- [ ] SSL padlock appears in browser (🔒)
- [ ] Hero section displays correctly on mobile
- [ ] All 4 category cards are visible and clickable

**Navigation:**
- [ ] Clinic card → opens forms/clinic-form.html
- [ ] Hospital card → opens forms/hospital-form.html
- [ ] Diagnostic card → opens forms/diagnostic-form.html
- [ ] Veterinary card → opens forms/veterinary-form.html
- [ ] "For Partners" link → opens partner.html
- [ ] Back buttons navigate correctly

**Forms (test each form):**
- [ ] City dropdown populates correctly
- [ ] Facility Type dropdown works
- [ ] Facility Category dropdown updates dynamically when Facility Type changes
- [ ] Phone field accepts only 10 digits
- [ ] Phone field rejects letters
- [ ] Submit with empty fields → shows error messages below each field
- [ ] Submit with invalid email → shows error
- [ ] Submit with 9-digit phone → shows error
- [ ] Valid submission → success panel appears
- [ ] "Register Another" button resets form

**Google Sheets:**
- [ ] After form submit, data appears in "CuraX Leads" sheet
- [ ] Timestamp is recorded correctly
- [ ] All fields captured (Name, Email, Phone, City, Type, Category, Business)
- [ ] Source column shows "curax.life"

**Mobile Responsiveness (Test on actual phone):**
- [ ] Site renders correctly on 375px (iPhone SE)
- [ ] Site renders correctly on 390px (iPhone 14)
- [ ] Site renders correctly on 412px (Android)
- [ ] Buttons are easy to tap (min 48px height)
- [ ] Form fields are easy to fill
- [ ] Keyboard doesn't break layout
- [ ] Sticky CTA appears when scrolling past hero

---

## STEP 5 — MAKING UPDATES AFTER DEPLOYMENT

### How to Update Files

**Via GitHub Web Interface:**
1. Navigate to the file in your repository
2. Click the pencil ✏️ edit icon
3. Make changes
4. Click **Commit changes**
5. GitHub Pages auto-redeploys within 2–5 minutes

**Via Git:**
```bash
# Make your changes to files locally
# Then:
git add .
git commit -m "Update: describe what you changed"
git push origin main
```

### Updating the Script URL

If you ever redeploy the Apps Script (creates a new URL):
1. Open `script.js`
2. Update `SCRIPT_URL` with the new URL
3. Push to GitHub

---

## STEP 6 — GOOGLE SHEETS MAINTENANCE

### Viewing Leads

1. Open your Google Spreadsheet
2. Click the "CuraX Leads" tab
3. New submissions appear at the bottom with timestamps

### Exporting Leads

- Click **File → Download → Microsoft Excel (.xlsx)**
- Or click **File → Download → CSV** for raw data

### Setting Up Notifications (Optional)

To get email/SMS alerts for new leads:
1. In the Apps Script editor, open `apps-script.gs`
2. Find `sendLeadNotificationEmail()` at the bottom
3. Replace `YOUR_EMAIL@gmail.com` with your email
4. In `doPost()`, uncomment this line:
   ```javascript
   // sendLeadNotificationEmail(fullName, phone, city, facilityType, businessName);
   ```
5. Remove the `//` at the start to activate it
6. Redeploy the Apps Script (Deploy → Manage deployments → Edit → New version → Deploy)

---

## STEP 7 — TROUBLESHOOTING

### Form submits but data doesn't appear in Google Sheets

**Cause:** SCRIPT_URL is wrong or Apps Script not deployed correctly.

**Fix:**
1. Open the SCRIPT_URL directly in a browser
2. If it shows `{"status":"ok",...}` — URL is working, check permissions
3. If you get a 404 — redeploy Apps Script and update URL in script.js
4. Make sure "Who has access" is set to **"Anyone"** (not just organization)

### Site shows blank page or 404 on GitHub Pages

**Fix:**
1. Confirm `index.html` is in the **root** of the repository (not inside a subfolder)
2. In Settings → Pages, confirm source is set to `main` branch, `/ (root)` folder
3. Wait 5–10 minutes after changes

### Domain not working (curax.life shows error)

**Fix:**
1. Check DNS at: https://dnschecker.org/#A/curax.life
2. All 4 GitHub IP addresses should appear
3. If not, re-verify DNS records at your registrar
4. Wait up to 48 hours for full propagation

### HTTPS shows "Not Secure" warning

**Fix:**
1. In GitHub Settings → Pages, click "Enforce HTTPS"
2. If greyed out, DNS may not have propagated yet — wait and retry

### Dynamic dropdown not working (category doesn't change)

**Fix:**
1. Open browser DevTools (F12) → Console tab
2. Check for JavaScript errors
3. Ensure `script.js` is loading (Network tab → check for 404s)
4. Confirm script path in form HTML is `../script.js` for forms subfolder

---

## QUICK REFERENCE

| Item | Value |
|------|-------|
| Live URL | https://curax.life |
| GitHub Repo | https://github.com/YOUR_USERNAME/curax-website |
| Google Sheet | Your spreadsheet URL |
| Apps Script | Extensions → Apps Script |
| GitHub Pages IP 1 | 185.199.108.153 |
| GitHub Pages IP 2 | 185.199.109.153 |
| GitHub Pages IP 3 | 185.199.110.153 |
| GitHub Pages IP 4 | 185.199.111.153 |
| CNAME Target | YOUR_USERNAME.github.io |

---

## FOLDER STRUCTURE REFERENCE

```
curax-website/
│
├── index.html              ← Main landing page
├── partner.html            ← Partner benefits & pricing
├── styles.css              ← Shared mobile-first CSS
├── script.js               ← JS: dropdowns, validation, submission
│
├── /assets
│   ├── logo.png            ← Add your logo here
│   ├── /icons
│   │   └── favicon.png     ← Add your favicon here
│   └── /images             ← Add any images here
│
├── /forms
│   ├── clinic-form.html    ← Clinic registration form
│   ├── hospital-form.html  ← Hospital registration form
│   ├── diagnostic-form.html← Diagnostic centre form
│   └── veterinary-form.html← Veterinary facility form
│
└── /backend
    └── apps-script.gs      ← Google Apps Script code
```

---

## COSTS SUMMARY

| Service | Cost |
|---------|------|
| GitHub Pages hosting | ₹0/month FREE |
| Google Sheets database | ₹0/month FREE |
| Google Apps Script backend | ₹0/month FREE |
| SSL Certificate | ₹0/month FREE (Let's Encrypt via GitHub) |
| Domain (curax.life) | ~₹800–1,200/year (domain registrar) |
| **Total monthly cost** | **₹0** |

---

*CuraX Deployment Guide v1.0 — Generated for curax.life*
*Zero backend cost architecture. Built for scale.*
