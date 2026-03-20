/**
 * ══════════════════════════════════════════════════════════
 *  CuraX — Google Apps Script Backend
 *  File: apps-script.gs
 *  Purpose: Receive form POSTs from curax.life and write
 *           lead data to a Google Sheet named "CuraX Leads"
 * ══════════════════════════════════════════════════════════
 *
 *  DEPLOYMENT STEPS (IMPORTANT — read carefully):
 *  ─────────────────────────────────────────────
 *  1. Open Google Sheets → Extensions → Apps Script
 *  2. Paste this entire file into the editor
 *  3. Save (Ctrl+S / Cmd+S)
 *  4. Click "Deploy" → "New deployment"
 *  5. Select type: "Web app"
 *  6. Execute as: "Me"
 *  7. Who has access: "Anyone" (required for public form)
 *  8. Click "Deploy" → copy the Web App URL
 *  9. Paste that URL into script.js as SCRIPT_URL
 * ══════════════════════════════════════════════════════════
 */

// ── Sheet Configuration ──────────────────────────────────
var SHEET_NAME = "CuraX Leads";

var COLUMN_HEADERS = [
  "Timestamp",
  "Full Name",
  "Email",
  "Phone",
  "City",
  "Facility Type",
  "Facility Category",
  "Business Name",
  "Source",
  "IP / User Agent",  // optional metadata
];

// ── doPost: Main Entry Point ─────────────────────────────
/**
 * Handles HTTP POST requests from the CuraX website forms.
 * Google Apps Script automatically routes web app POSTs here.
 */
function doPost(e) {
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Auto-create sheet + headers if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(COLUMN_HEADERS);

      // Style the header row
      var headerRange = sheet.getRange(1, 1, 1, COLUMN_HEADERS.length);
      headerRange.setBackground("#0066CC");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setFontSize(11);
      sheet.setFrozenRows(1);

      // Set column widths for readability
      sheet.setColumnWidth(1, 160);  // Timestamp
      sheet.setColumnWidth(2, 160);  // Full Name
      sheet.setColumnWidth(3, 200);  // Email
      sheet.setColumnWidth(4, 130);  // Phone
      sheet.setColumnWidth(5, 130);  // City
      sheet.setColumnWidth(6, 150);  // Facility Type
      sheet.setColumnWidth(7, 180);  // Facility Category
      sheet.setColumnWidth(8, 220);  // Business Name
      sheet.setColumnWidth(9, 120);  // Source
      sheet.setColumnWidth(10, 200); // IP / UA
    }

    // ── Parse incoming JSON ──────────────────────────────
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    // ── Sanitize inputs ──────────────────────────────────
    var fullName         = sanitize(data.fullName         || data.name || "");
    var email            = sanitize(data.email            || "");
    var phone            = sanitize(data.phone            || "");
    var city             = sanitize(data.city             || "");
    var facilityType     = sanitize(data.facilityType     || "");
    var facilityCategory = sanitize(data.facilityCategory || data.facilitySubtype || "");
    var businessName     = sanitize(data.businessName     || "");
    var source           = sanitize(data.source           || "curax.life");
    var userAgent        = (e && e.parameter && e.parameter.ua) ? e.parameter.ua : "web-form";

    // ── Validate required fields ─────────────────────────
    if (!fullName || !email || !phone) {
      return buildResponse(false, "Missing required fields: name, email, or phone.");
    }

    // Basic email format check
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return buildResponse(false, "Invalid email format.");
    }

    // Basic phone check (10 digits, Indian format)
    var phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return buildResponse(false, "Invalid phone number format.");
    }

    // ── Duplicate check (optional — checks last 500 rows) ──
    var isDuplicate = checkDuplicate(sheet, phone, email);
    if (isDuplicate) {
      // Still return success to avoid UX issues, but log separately
      Logger.log("Duplicate submission detected: " + phone + " / " + email);
      // Uncomment line below to block duplicates instead:
      // return buildResponse(false, "This phone or email is already registered.");
    }

    // ── Append row ───────────────────────────────────────
    var timestamp = new Date();
    var newRow = [
      timestamp,
      fullName,
      email,
      phone,
      city,
      facilityType,
      facilityCategory,
      businessName,
      source,
      userAgent,
    ];

    sheet.appendRow(newRow);

    // Format the newly inserted row
    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, COLUMN_HEADERS.length);

    // Alternate row shading for readability
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#F0F7FF");
    }

    // Format timestamp cell
    sheet.getRange(lastRow, 1).setNumberFormat("dd-mmm-yyyy HH:mm:ss");

    // ── Send email notification (optional) ───────────────
    // Uncomment and set your email to receive instant lead alerts:
    // sendLeadNotificationEmail(fullName, phone, city, facilityType, businessName);

    Logger.log("CuraX Lead captured: " + fullName + " | " + phone + " | " + city);

    return buildResponse(true, "Registration successful!");

  } catch (err) {
    Logger.log("CuraX Apps Script Error: " + err.toString());
    return buildResponse(false, "Server error: " + err.message);
  }
}

// ── doGet: Health Check ──────────────────────────────────
/**
 * Handles GET requests — used to verify the script is deployed
 * Visit the web app URL in a browser to check deployment.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "ok",
      message: "CuraX backend is running. POST to this URL to submit leads.",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helper: Build JSON Response ──────────────────────────
function buildResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: success,
      message: message,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helper: Sanitize Input ───────────────────────────────
function sanitize(value) {
  if (typeof value !== "string") return String(value || "");
  // Remove potential formula injection (XSS in sheets)
  var cleaned = value.trim();
  if (cleaned.startsWith("=") || cleaned.startsWith("+") ||
      cleaned.startsWith("-") || cleaned.startsWith("@")) {
    cleaned = "'" + cleaned;
  }
  return cleaned.substring(0, 500); // max 500 chars
}

// ── Helper: Check Duplicate ──────────────────────────────
function checkDuplicate(sheet, phone, email) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  // Check last 500 rows for performance
  var checkFrom = Math.max(2, lastRow - 498);
  var checkRows = lastRow - checkFrom + 1;

  if (checkRows <= 0) return false;

  // Phone is column 4, email is column 3
  var phoneData = sheet.getRange(checkFrom, 4, checkRows, 1).getValues();
  var emailData = sheet.getRange(checkFrom, 3, checkRows, 1).getValues();

  for (var i = 0; i < checkRows; i++) {
    if (phoneData[i][0] === phone || emailData[i][0] === email) {
      return true;
    }
  }
  return false;
}

// ── Optional: Email Notification ─────────────────────────
/**
 * Sends an email alert when a new lead is registered.
 * Uncomment the call in doPost() above and set YOUR_EMAIL.
 */
function sendLeadNotificationEmail(name, phone, city, facilityType, businessName) {
  var YOUR_EMAIL = "YOUR_EMAIL@gmail.com"; // ← Replace with your email

  var subject = "🏥 New CuraX Lead: " + name + " (" + facilityType + ")";
  var body = [
    "New partner registration on CuraX!\n",
    "Name: "         + name,
    "Phone: "        + phone,
    "City: "         + city,
    "Facility Type: "+ facilityType,
    "Business: "     + businessName,
    "\nView all leads: https://docs.google.com/spreadsheets/d/" +
      SpreadsheetApp.getActiveSpreadsheet().getId()
  ].join("\n");

  try {
    MailApp.sendEmail(YOUR_EMAIL, subject, body);
  } catch (e) {
    Logger.log("Email send failed: " + e.message);
  }
}

// ── Manual Test Function ─────────────────────────────────
/**
 * Run this function manually from Apps Script editor to test
 * the sheet setup without a real form submission.
 */
function testManualSubmit() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        fullName:         "Dr. Test User",
        email:            "test@curax.life",
        phone:            "9876543210",
        city:             "Hyderabad",
        facilityType:     "Clinic",
        facilityCategory: "dental-clinic",
        businessName:     "Test Dental Clinic",
        source:           "curax.life"
      })
    }
  };

  var result = doPost(mockEvent);
  Logger.log("Test result: " + result.getContent());
}
