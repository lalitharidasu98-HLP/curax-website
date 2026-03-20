/**
 * CuraX Website — script.js
 * Dynamic Dropdowns | Form Validation | Google Sheets Submission
 * Version: 1.0.0 | curax.life
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * IMPORTANT: Replace SCRIPT_URL below with your
 * deployed Google Apps Script Web App URL.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
// Example: "https://script.google.com/macros/s/AKfycby.../exec"

/* ─────────────────────────────────────────────
   1. CATEGORY DATA — Facility Type → Sub-Types
   ───────────────────────────────────────────── */
const FACILITY_CATEGORIES = {
  Clinic: [
    { value: "single-doctor-clinic",    label: "Single-Doctor Clinic" },
    { value: "multi-doctor-clinic",     label: "Multi-Doctor Clinic" },
    { value: "dental-clinic",           label: "Dental Clinic" },
    { value: "dermatology-clinic",      label: "Dermatology Clinic" },
    { value: "physiotherapy-clinic",    label: "Physiotherapy Clinic" },
  ],
  Hospital: [
    { value: "general-hospital",        label: "General Hospital" },
    { value: "multi-specialty",         label: "Multi-Specialty Hospital" },
    { value: "super-specialty",         label: "Super-Specialty Hospital" },
    { value: "maternity-hospital",      label: "Maternity Hospital" },
    { value: "cardiac-hospital",        label: "Cardiac Hospital" },
  ],
  Diagnostic: [
    { value: "pathology-lab",           label: "Pathology Lab" },
    { value: "imaging-centre",          label: "Imaging Centre" },
    { value: "integrated-diagnostic",   label: "Integrated Diagnostic Centre" },
  ],
  Veterinary: [
    { value: "single-vet-clinic",       label: "Single Vet Clinic" },
    { value: "multi-vet-hospital",      label: "Multi Vet Hospital" },
    { value: "pet-grooming-centre",     label: "Pet Grooming Centre" },
  ],
};

/* ─────────────────────────────────────────────
   2. CITIES LIST (Telangana + Major Indian)
   ───────────────────────────────────────────── */
const CITIES = [
  // Telangana
  "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
  "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet",
  "Siddipet", "Miryalaguda", "Sangareddy", "Mancherial", "Jagtial",
  "Bhongir", "Vikarabad", "Wanaparthy", "Nagarkurnool",
  // Other Major Cities
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat",
  "Kochi", "Bhopal", "Indore", "Chandigarh", "Nagpur",
  "Other",
];

/* ─────────────────────────────────────────────
   3. POPULATE CITY DROPDOWN
   ───────────────────────────────────────────── */
function populateCities(selectId = "city") {
  const citySelect = document.getElementById(selectId);
  if (!citySelect) return;

  CITIES.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
}

/* ─────────────────────────────────────────────
   4. DYNAMIC FACILITY CATEGORY DROPDOWN
   ───────────────────────────────────────────── */
function populateCategories(facilityType, categorySelectId = "facilityCategory") {
  const catSelect = document.getElementById(categorySelectId);
  if (!catSelect) return;

  // Clear previous
  catSelect.innerHTML = '<option value="">— Select Category —</option>';
  catSelect.disabled = true;

  if (!facilityType || !FACILITY_CATEGORIES[facilityType]) return;

  const options = FACILITY_CATEGORIES[facilityType];
  options.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.value;
    opt.textContent = item.label;
    catSelect.appendChild(opt);
  });

  catSelect.disabled = false;
  catSelect.focus();
}

/* ─────────────────────────────────────────────
   5. VALIDATION HELPERS
   ───────────────────────────────────────────── */
const Validators = {
  required: (val) => val.trim().length > 0,

  phone: (val) => /^[6-9]\d{9}$/.test(val.trim()),

  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()),

  name: (val) => val.trim().length >= 2 && val.trim().length <= 80,
};

const ERROR_MESSAGES = {
  fullName:        "Full name is required (min 2 characters).",
  email:           "Please enter a valid email address.",
  phone:           "Enter a valid 10-digit Indian mobile number.",
  city:            "Please select your city.",
  facilityType:    "Please select your facility type.",
  facilityCategory:"Please select the facility category.",
  businessName:    "Facility/Business name is required.",
};

/* ─────────────────────────────────────────────
   6. FIELD-LEVEL VALIDATION & UI FEEDBACK
   ───────────────────────────────────────────── */
function showError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "Error");

  if (input) {
    input.classList.add("error");
    input.classList.remove("success");
    input.setAttribute("aria-invalid", "true");
  }
  if (errorEl) {
    errorEl.textContent = "⚠ " + message;
    errorEl.classList.remove("hidden");
  }
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "Error");

  if (input) {
    input.classList.remove("error");
    input.classList.add("success");
    input.setAttribute("aria-invalid", "false");
  }
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }
}

function clearAllErrors(formEl) {
  const inputs = formEl.querySelectorAll(".field-input");
  inputs.forEach((inp) => {
    inp.classList.remove("error", "success");
    inp.removeAttribute("aria-invalid");
  });
  const errors = formEl.querySelectorAll(".field-error");
  errors.forEach((el) => {
    el.textContent = "";
    el.classList.add("hidden");
  });
}

/* ─────────────────────────────────────────────
   7. VALIDATE ENTIRE FORM
   Returns: true if valid, false otherwise
   ───────────────────────────────────────────── */
function validateForm(formEl) {
  let isValid = true;

  // Full Name
  const fullName = formEl.querySelector("#fullName");
  if (fullName) {
    if (!Validators.required(fullName.value) || !Validators.name(fullName.value)) {
      showError("fullName", ERROR_MESSAGES.fullName);
      isValid = false;
    } else {
      clearError("fullName");
    }
  }

  // Email
  const email = formEl.querySelector("#email");
  if (email) {
    if (!Validators.required(email.value) || !Validators.email(email.value)) {
      showError("email", ERROR_MESSAGES.email);
      isValid = false;
    } else {
      clearError("email");
    }
  }

  // Phone
  const phone = formEl.querySelector("#phone");
  if (phone) {
    if (!Validators.phone(phone.value)) {
      showError("phone", ERROR_MESSAGES.phone);
      isValid = false;
    } else {
      clearError("phone");
    }
  }

  // City
  const city = formEl.querySelector("#city");
  if (city) {
    if (!Validators.required(city.value)) {
      showError("city", ERROR_MESSAGES.city);
      isValid = false;
    } else {
      clearError("city");
    }
  }

  // Facility Type
  const facilityType = formEl.querySelector("#facilityType");
  if (facilityType) {
    if (!Validators.required(facilityType.value)) {
      showError("facilityType", ERROR_MESSAGES.facilityType);
      isValid = false;
    } else {
      clearError("facilityType");
    }
  }

  // Facility Category
  const facilityCategory = formEl.querySelector("#facilityCategory");
  if (facilityCategory) {
    if (!Validators.required(facilityCategory.value)) {
      showError("facilityCategory", ERROR_MESSAGES.facilityCategory);
      isValid = false;
    } else {
      clearError("facilityCategory");
    }
  }

  // Business Name
  const businessName = formEl.querySelector("#businessName");
  if (businessName) {
    if (!Validators.required(businessName.value)) {
      showError("businessName", ERROR_MESSAGES.businessName);
      isValid = false;
    } else {
      clearError("businessName");
    }
  }

  return isValid;
}

/* ─────────────────────────────────────────────
   8. TOAST NOTIFICATION
   ───────────────────────────────────────────── */
function showToast(message, type = "success", duration = 4000) {
  let toast = document.getElementById("cxToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cxToast";
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = "toast " + type;

  // Force reflow then show
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add("show"); });
  });

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* ─────────────────────────────────────────────
   9. FORM SUBMISSION TO GOOGLE APPS SCRIPT
   ───────────────────────────────────────────── */
async function submitToGoogleSheets(payload) {
  // NOTE: Google Apps Script requires no-cors for direct browser POST
  const response = await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",            // Required for Google Apps Script
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // With no-cors, we can't read the response body.
  // Treat any non-network error as success (Apps Script handles it).
  return { success: true };
}

/* ─────────────────────────────────────────────
   10. MAIN FORM HANDLER
   ───────────────────────────────────────────── */
function initCuraXForm(formId, defaultFacilityType = null) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Populate cities
  populateCities("city");

  // If a default facility type is set (for dedicated form pages)
  const facilityTypeSelect = document.getElementById("facilityType");
  if (facilityTypeSelect && defaultFacilityType) {
    facilityTypeSelect.value = defaultFacilityType;
    facilityTypeSelect.dispatchEvent(new Event("change"));
  }

  // Wire up facility type → category dropdown
  if (facilityTypeSelect) {
    facilityTypeSelect.addEventListener("change", (e) => {
      populateCategories(e.target.value, "facilityCategory");
      clearError("facilityType");
      clearError("facilityCategory");
    });
  }

  // Real-time inline validation on blur
  const inputs = form.querySelectorAll(".field-input");
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      triggerInlineValidation(input);
    });
    input.addEventListener("input", () => {
      if (input.classList.contains("error")) {
        triggerInlineValidation(input);
      }
    });
  });

  // Phone — allow only digits
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").substring(0, 10);
    });
  }

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isValid = validateForm(form);
    if (!isValid) {
      // Scroll to first error
      const firstError = form.querySelector(".field-input.error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
      showToast("Please fix the errors above.", "error");
      return;
    }

    // Check if script URL is configured
    if (SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      showToast("⚠ Backend URL not configured yet. Contact the developer.", "error", 5000);
      return;
    }

    // Build payload
    const payload = {
      fullName:         document.getElementById("fullName")?.value.trim()         || "",
      email:            document.getElementById("email")?.value.trim()            || "",
      phone:            document.getElementById("phone")?.value.trim()            || "",
      city:             document.getElementById("city")?.value                    || "",
      facilityType:     document.getElementById("facilityType")?.value            || "",
      facilityCategory: document.getElementById("facilityCategory")?.value        || "",
      businessName:     document.getElementById("businessName")?.value.trim()     || "",
      source:           "curax.life",
      timestamp:        new Date().toISOString(),
    };

    // Set loading state
    const submitBtn = form.querySelector(".submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("loading");
    }

    try {
      await submitToGoogleSheets(payload);

      // Success UI
      const formCard   = document.getElementById("formCard");
      const successPanel = document.getElementById("successPanel");

      if (formCard && successPanel) {
        formCard.style.display = "none";
        successPanel.classList.add("show");
        successPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        showToast("✅ Registration submitted! We'll contact you shortly.", "success", 6000);
      }

      // Reset form
      form.reset();
      clearAllErrors(form);
      const catSelect = document.getElementById("facilityCategory");
      if (catSelect) {
        catSelect.innerHTML = '<option value="">— Select Category —</option>';
        catSelect.disabled = true;
      }

    } catch (err) {
      console.error("Submission error:", err);
      showToast("Network error. Please check your connection and try again.", "error", 5000);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
      }
    }
  });
}

/* ─────────────────────────────────────────────
   11. INLINE VALIDATION HELPER
   ───────────────────────────────────────────── */
function triggerInlineValidation(input) {
  const id = input.id;
  const val = input.value;

  switch (id) {
    case "fullName":
      (!Validators.required(val) || !Validators.name(val))
        ? showError(id, ERROR_MESSAGES.fullName)
        : clearError(id);
      break;
    case "email":
      (!Validators.required(val) || !Validators.email(val))
        ? showError(id, ERROR_MESSAGES.email)
        : clearError(id);
      break;
    case "phone":
      !Validators.phone(val)
        ? showError(id, ERROR_MESSAGES.phone)
        : clearError(id);
      break;
    case "city":
    case "facilityType":
    case "facilityCategory":
    case "businessName":
      !Validators.required(val)
        ? showError(id, ERROR_MESSAGES[id] || "This field is required.")
        : clearError(id);
      break;
    default:
      break;
  }
}

/* ─────────────────────────────────────────────
   12. STICKY CTA VISIBILITY (Index page)
   ───────────────────────────────────────────── */
function initStickyCTA() {
  const stickyCTA = document.getElementById("stickyCTA");
  if (!stickyCTA) return;

  const heroSection = document.querySelector(".hero");
  if (!heroSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          stickyCTA.classList.add("visible");
        } else {
          stickyCTA.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(heroSection);
}

/* ─────────────────────────────────────────────
   13. SCROLL TO TOP BUTTON
   ───────────────────────────────────────────── */
function initScrollTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ─────────────────────────────────────────────
   14. REGISTER ANOTHER — success panel reset
   ───────────────────────────────────────────── */
function registerAnother() {
  const formCard     = document.getElementById("formCard");
  const successPanel = document.getElementById("successPanel");

  if (formCard && successPanel) {
    successPanel.classList.remove("show");
    formCard.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ─────────────────────────────────────────────
   15. DOM READY INIT
   ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Scroll top
  initScrollTop();

  // Sticky CTA (index page)
  initStickyCTA();

  // Init form if present (each page passes its own default type)
  // This is called inline in each form page with correct defaultFacilityType
  // e.g., initCuraXForm("registrationForm", "Clinic");
});
