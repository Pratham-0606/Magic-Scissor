/**
 * Magic Scissors - Unified Feedback, Loading Skeletons & Error Handling System
 * Production-ready, accessible, and strictly aligned with Magic Scissors design tokens.
 */

// --------------------------------------------------------------------------
// 1. ButtonLoader: Zero-CLS button loading state controller
// --------------------------------------------------------------------------
export class ButtonLoader {
  /**
   * Put button into loading state
   * @param {HTMLElement} btn - The button element
   * @param {string} loadingText - Contextual loading message
   */
  static start(btn, loadingText = "Processing...") {
    if (!btn || btn.classList.contains("is-loading")) return;

    // Measure and lock exact dimensions to prevent Cumulative Layout Shift (CLS)
    const rect = btn.getBoundingClientRect();
    const currentWidth = btn.offsetWidth || rect.width;
    const currentHeight = btn.offsetHeight || rect.height;

    btn._originalContent = btn.innerHTML;
    btn._originalDisabled = btn.disabled;
    btn._originalMinWidth = btn.style.minWidth;
    btn._originalMinHeight = btn.style.minHeight;

    if (currentWidth > 0) {
      btn.style.minWidth = `${Math.ceil(currentWidth)}px`;
    }
    if (currentHeight > 0) {
      btn.style.minHeight = `${Math.ceil(currentHeight)}px`;
    }

    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    btn.classList.add("is-loading");

    btn.innerHTML = `
      <span class="btn-loading-content">
        <span class="ms-spinner" aria-hidden="true"></span>
        <span>${loadingText}</span>
      </span>
    `;
  }

  /**
   * Restore button to normal interactive state
   * @param {HTMLElement} btn - The button element
   */
  static stop(btn) {
    if (!btn || !btn.classList.contains("is-loading")) return;

    if (typeof btn._originalContent === "string") {
      btn.innerHTML = btn._originalContent;
    }
    btn.disabled = btn._originalDisabled !== undefined ? btn._originalDisabled : false;
    btn.removeAttribute("aria-busy");
    btn.classList.remove("is-loading");

    btn.style.minWidth = btn._originalMinWidth || "";
    btn.style.minHeight = btn._originalMinHeight || "";

    delete btn._originalContent;
    delete btn._originalDisabled;
    delete btn._originalMinWidth;
    delete btn._originalMinHeight;
  }
}

// --------------------------------------------------------------------------
// 2. ToastManager: Accessible Floating Notification System
// --------------------------------------------------------------------------
class ToastManagerClass {
  constructor() {
    this.container = null;
    this.activeToasts = new Set();
  }

  getContainer() {
    if (!this.container || (typeof document.body?.contains === "function" && !document.body.contains(this.container))) {
      this.container = document.getElementById("msToastContainer");
      if (!this.container) {
        this.container = document.createElement("div");
        this.container.id = "msToastContainer";
        this.container.setAttribute("role", "region");
        this.container.setAttribute("aria-label", "System Notifications");
        this.container.setAttribute("aria-live", "polite");
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  /**
   * Show a toast message
   * @param {string} message - Text message
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {Object} options - { title, duration, retryText, onRetry }
   */
  show(message, type = "info", options = {}) {
    const container = this.getContainer();
    const duration = options.duration !== undefined ? options.duration : 5000;

    // Prevent duplicate toast spam with identical message
    const existing = Array.from(this.activeToasts).find(t => t._msg === message);
    if (existing) {
      existing.style.animation = "none";
      setTimeout(() => { existing.style.animation = ""; }, 10);
      return existing;
    }

    const toast = document.createElement("div");
    toast.className = `ms-toast toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast._msg = message;

    const icons = {
      success: "✓",
      error: "⚠️",
      warning: "⚡",
      info: "✦"
    };

    const titleHtml = options.title ? `<div class="ms-toast-title">${options.title}</div>` : "";
    const retryHtml = (options.onRetry && typeof options.onRetry === "function")
      ? `<button type="button" class="toast-retry-btn">${options.retryText || "Retry"}</button>`
      : "";

    toast.innerHTML = `
      <span class="ms-toast-icon" aria-hidden="true">${icons[type] || "✦"}</span>
      <div class="ms-toast-content">
        ${titleHtml}
        <div class="ms-toast-message">${message}</div>
        ${retryHtml ? `<div class="ms-toast-actions">${retryHtml}</div>` : ""}
      </div>
      <button type="button" class="toast-close-btn" aria-label="Dismiss notification">✕</button>
    `;

    // Bind Close
    const closeBtn = toast.querySelector(".toast-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.dismiss(toast));
    }

    // Bind Retry
    if (retryHtml) {
      const retryBtn = toast.querySelector(".toast-retry-btn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          this.dismiss(toast);
          options.onRetry();
        });
      }
    }

    container.appendChild(toast);
    this.activeToasts.add(toast);

    if (duration > 0) {
      toast._timeout = setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    if (toast._timeout) clearTimeout(toast._timeout);
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px) scale(0.96)";
    setTimeout(() => {
      this.activeToasts.delete(toast);
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }

  success(message, options = {}) {
    return this.show(message, "success", options);
  }

  error(message, options = {}) {
    return this.show(message, "error", options);
  }

  warning(message, options = {}) {
    return this.show(message, "warning", options);
  }

  info(message, options = {}) {
    return this.show(message, "info", options);
  }
}

export const ToastManager = new ToastManagerClass();

// --------------------------------------------------------------------------
// 3. FormValidator: Inline Form Validation with Instant Correction Feedback
// --------------------------------------------------------------------------
export class FormValidator {
  /**
   * Set field inline error
   * @param {HTMLElement} input - Form field
   * @param {string} message - Error text
   */
  static setFieldError(input, message) {
    if (!input) return;
    input.classList.add("input-invalid");
    input.setAttribute("aria-invalid", "true");

    const parent = input.closest(".luxury-form-group") || input.parentElement;
    if (!parent) return;

    let errorEl = parent.querySelector(".field-error-msg");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "field-error-msg";
      errorEl.id = `err_${input.name || input.id || Math.random().toString(36).substr(2, 6)}`;
      parent.appendChild(errorEl);
    }

    errorEl.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    errorEl.classList.add("active");
    input.setAttribute("aria-errormessage", errorEl.id);

    // Clear error immediately on user edit
    const clearOnInput = () => {
      FormValidator.clearFieldError(input);
      input.removeEventListener("input", clearOnInput);
      input.removeEventListener("change", clearOnInput);
    };
    input.addEventListener("input", clearOnInput);
    input.addEventListener("change", clearOnInput);
  }

  /**
   * Clear field error
   * @param {HTMLElement} input - Form field
   */
  static clearFieldError(input) {
    if (!input) return;
    input.classList.remove("input-invalid");
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-errormessage");

    const parent = input.closest(".luxury-form-group") || input.parentElement;
    if (parent) {
      const errorEl = parent.querySelector(".field-error-msg");
      if (errorEl) {
        errorEl.classList.remove("active");
        errorEl.innerHTML = "";
      }
    }
  }

  /**
   * Clear all errors in a form
   * @param {HTMLFormElement} form
   */
  static clearAllErrors(form) {
    if (!form) return;
    form.querySelectorAll(".input-invalid").forEach(input => {
      FormValidator.clearFieldError(input);
    });
  }

  /**
   * Validate appointment booking form
   * @param {HTMLFormElement} form
   * @returns {{ isValid: boolean, errors: Object, data: Object }}
   */
  static validateAppointmentForm(form) {
    this.clearAllErrors(form);

    let isValid = true;
    let firstInvalidField = null;
    const errors = {};

    // 1. Client Name
    const nameInput = form.clientName;
    const name = nameInput?.value?.trim() || "";
    if (!name) {
      this.setFieldError(nameInput, "Please enter your full name.");
      errors.name = "Full name required";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = nameInput;
    } else if (name.length < 2) {
      this.setFieldError(nameInput, "Full name must be at least 2 characters.");
      errors.name = "Name too short";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = nameInput;
    }

    // 2. Client Phone
    const phoneInput = form.clientPhone;
    const rawPhone = phoneInput?.value?.trim() || "";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    if (!rawPhone) {
      this.setFieldError(phoneInput, "Please enter your contact mobile number.");
      errors.phone = "Phone required";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = phoneInput;
    } else if (cleanPhone.length < 10) {
      this.setFieldError(phoneInput, "Please enter a valid 10-digit mobile number.");
      errors.phone = "Invalid phone number";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = phoneInput;
    }

    // 3. Service Selection
    const serviceSelect = form.bookingServiceSelect;
    const serviceId = serviceSelect?.value || "";
    if (!serviceId) {
      this.setFieldError(serviceSelect, "Please select your preferred salon service.");
      errors.service = "Service selection required";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = serviceSelect;
    }

    // 4. Preferred Date
    const dateInput = form.bookingDate;
    const dateVal = dateInput?.value || "";
    const today = new Date().toISOString().split("T")[0];

    if (!dateVal) {
      this.setFieldError(dateInput, "Please choose your preferred appointment date.");
      errors.date = "Date required";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = dateInput;
    } else if (dateVal < today) {
      this.setFieldError(dateInput, "Appointment date cannot be in the past. Please select today or later.");
      errors.date = "Past date selected";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = dateInput;
    }

    // 5. Preferred Time
    const timeSelect = form.bookingTime;
    const timeVal = timeSelect?.value || "";
    if (!timeVal) {
      this.setFieldError(timeSelect, "Please select a preferred time slot.");
      errors.time = "Time slot required";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = timeSelect;
    }

    if (!isValid && firstInvalidField) {
      firstInvalidField.focus();
    }

    return {
      isValid,
      errors,
      data: {
        clientName: name,
        clientPhone: rawPhone,
        serviceId: serviceId,
        preferredDate: dateVal,
        timeSlot: timeVal,
        notes: form.bookingNotes?.value?.trim() || ""
      }
    };
  }

  /**
   * Validate franchise inquiry form
   * @param {HTMLFormElement} form
   * @returns {{ isValid: boolean, errors: Object, data: Object }}
   */
  static validateFranchiseForm(form) {
    this.clearAllErrors(form);

    let isValid = true;
    let firstInvalidField = null;
    const errors = {};

    const nameInput = form.fName;
    const name = nameInput?.value?.trim() || "";
    if (!name || name.length < 2) {
      this.setFieldError(nameInput, "Please enter your full name.");
      errors.name = "Name required";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = nameInput;
    }

    const phoneInput = form.fPhone;
    const rawPhone = phoneInput?.value?.trim() || "";
    const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
    if (!rawPhone || cleanPhone.length < 10) {
      this.setFieldError(phoneInput, "Please enter a valid 10-digit mobile number.");
      errors.phone = "Invalid mobile number";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = phoneInput;
    }

    const cityInput = form.fCity;
    const city = cityInput?.value?.trim() || "";
    if (!city) {
      this.setFieldError(cityInput, "Please specify your target city or location.");
      errors.city = "City required";
      isValid = false;
      if (!firstInvalidField) firstInvalidField = cityInput;
    }

    if (!isValid && firstInvalidField) {
      firstInvalidField.focus();
    }

    return {
      isValid,
      errors,
      data: {
        name,
        phone: rawPhone,
        city,
        model: form.fModel?.value || "Studio Boutique",
        notes: form.fNotes?.value?.trim() || ""
      }
    };
  }
}

// --------------------------------------------------------------------------
// 4. Skeleton: High-Fidelity Skeletons Matching Magic Scissors Components
// --------------------------------------------------------------------------
export class Skeleton {
  /**
   * Render Service Grid Skeletons
   * @param {HTMLElement} container
   * @param {number} count
   */
  static renderServiceGrid(container, count = 6) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="service-card-skeleton" aria-hidden="true">
        <div class="skeleton-media ms-skeleton"></div>
        <div class="skeleton-body">
          <div class="ms-skeleton ms-skeleton-title"></div>
          <div class="ms-skeleton ms-skeleton-text"></div>
          <div class="ms-skeleton ms-skeleton-text short"></div>
          <div class="skeleton-meta">
            <div class="ms-skeleton ms-skeleton-text short" style="width: 70px; margin-bottom: 0;"></div>
            <div class="ms-skeleton ms-skeleton-btn" style="width: 120px; height: 34px;"></div>
          </div>
        </div>
      </div>
    `).join("");
  }

  /**
   * Render Gallery Grid Skeletons
   * @param {HTMLElement} container
   * @param {number} count
   */
  static renderGalleryGrid(container, count = 6) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="gallery-card-skeleton ms-skeleton" aria-hidden="true">
        <div class="skeleton-overlay">
          <div class="ms-skeleton ms-skeleton-text short" style="width: 80px; height: 16px; background: rgba(255,255,255,0.15);"></div>
          <div class="ms-skeleton ms-skeleton-title" style="width: 65%; height: 20px; background: rgba(255,255,255,0.2);"></div>
        </div>
      </div>
    `).join("");
  }

  /**
   * Render Appointment Card Skeletons (Concierge & Profile)
   * @param {HTMLElement} container
   * @param {number} count
   * @param {boolean} lightMode
   */
  static renderAppointmentList(container, count = 3, lightMode = false) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="appointment-card-skeleton ${lightMode ? 'light-mode' : ''}" aria-hidden="true">
        <div class="skeleton-header">
          <div style="width: 50%;">
            <div class="ms-skeleton ms-skeleton-title" style="height: 18px; width: 75%; margin-bottom: 6px;"></div>
            <div class="ms-skeleton ms-skeleton-text short" style="height: 11px; margin-bottom: 0;"></div>
          </div>
          <div class="ms-skeleton" style="width: 85px; height: 24px; border-radius: 9999px;"></div>
        </div>
        <div class="skeleton-details-box">
          <div class="ms-skeleton ms-skeleton-text medium" style="height: 14px; margin-bottom: 4px;"></div>
          <div class="ms-skeleton ms-skeleton-text short" style="height: 11px; margin-bottom: 0;"></div>
        </div>
        <div class="skeleton-actions">
          <div class="ms-skeleton ms-skeleton-btn" style="width: 110px; height: 30px; border-radius: 6px;"></div>
          <div class="ms-skeleton ms-skeleton-btn" style="width: 80px; height: 30px; border-radius: 6px;"></div>
        </div>
      </div>
    `).join("");
  }

  /**
   * Render Concierge Metrics Strip Skeleton
   * @param {HTMLElement} container
   */
  static renderMetricsStrip(container) {
    if (!container) return;
    container.innerHTML = Array.from({ length: 4 }, () => `
      <div class="metric-card-skeleton" aria-hidden="true">
        <div class="ms-skeleton ms-skeleton-title" style="height: 28px; width: 45px; margin-bottom: 4px;"></div>
        <div class="ms-skeleton ms-skeleton-text short" style="height: 10px; width: 65px; margin-bottom: 0;"></div>
      </div>
    `).join("");
  }

  /**
   * Render VIP Profile Skeleton
   * @param {HTMLElement} container
   */
  static renderProfile(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="profile-skeleton" aria-hidden="true">
        <div class="profile-skeleton-header">
          <div style="flex-grow: 1;">
            <div class="ms-skeleton" style="width: 110px; height: 22px; border-radius: 9999px; margin-bottom: 12px;"></div>
            <div class="ms-skeleton ms-skeleton-title" style="height: 26px; width: 60%; margin-bottom: 8px;"></div>
            <div class="ms-skeleton ms-skeleton-text medium" style="height: 13px; margin-bottom: 0;"></div>
          </div>
          <div class="ms-skeleton" style="width: 105px; height: 60px; border-radius: 12px; flex-shrink: 0;"></div>
        </div>
        <div>
          <div class="ms-skeleton ms-skeleton-title" style="height: 20px; width: 45%; margin-bottom: 14px;"></div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${Array.from({ length: 2 }, () => `
              <div class="appointment-card-skeleton" style="padding: 14px;">
                <div class="ms-skeleton ms-skeleton-title" style="height: 16px; width: 60%; margin-bottom: 6px;"></div>
                <div class="ms-skeleton ms-skeleton-text short" style="height: 12px; margin-bottom: 0;"></div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;
  }
}

// --------------------------------------------------------------------------
// 5. EmptyState: Elegant Zero-Result Components with CTAs
// --------------------------------------------------------------------------
export class EmptyState {
  /**
   * Render empty state card
   * @param {HTMLElement} container
   * @param {Object} options - { icon, title, description, actionText, onAction, actionHref }
   */
  static render(container, options = {}) {
    if (!container) return;
    const {
      icon = "✂️",
      title = "No Records Found",
      description = "There are no items to display at this moment.",
      actionText = null,
      onAction = null,
      actionHref = null
    } = options;

    let actionHtml = "";
    if (actionText) {
      if (actionHref) {
        actionHtml = `<a href="${actionHref}" class="btn btn-outline-gold ms-empty-action" style="padding: 8px 20px; font-size: 0.85rem;">${actionText}</a>`;
      } else {
        actionHtml = `<button type="button" class="btn btn-outline-gold ms-empty-action" style="padding: 8px 20px; font-size: 0.85rem;">${actionText}</button>`;
      }
    }

    container.innerHTML = `
      <div class="ms-empty-state">
        <div class="ms-empty-icon" aria-hidden="true">${icon}</div>
        <h4 class="ms-empty-title">${title}</h4>
        <p class="ms-empty-desc">${description}</p>
        ${actionHtml}
      </div>
    `;

    if (actionText && onAction && !actionHref) {
      const btn = container.querySelector(".ms-empty-action");
      if (btn) btn.addEventListener("click", onAction);
    }
  }
}

// --------------------------------------------------------------------------
// 6. ErrorClassifier: Translates Technical Errors into User-Friendly Guidance
// --------------------------------------------------------------------------
export class ErrorClassifier {
  /**
   * Classify technical exception or error string
   * @param {Error|string} error
   * @returns {{ category: string, userMessage: string, canRetry: boolean }}
   */
  static classify(error) {
    const raw = (error?.message || String(error || "")).toLowerCase();

    // 1. Network Failure
    if (raw.includes("failed to fetch") || raw.includes("networkerror") || raw.includes("offline") || (typeof navigator !== "undefined" && navigator.onLine === false)) {
      return {
        category: "Network Error",
        userMessage: "Unable to connect to the salon network. Please check your internet connection and try again.",
        canRetry: true
      };
    }

    // 2. Authentication Failure
    if (raw.includes("invalid login credentials") || raw.includes("invalid password") || raw.includes("user not found") || raw.includes("auth")) {
      return {
        category: "Authentication Error",
        userMessage: "Invalid email or password. Please verify your VIP credentials and try again.",
        canRetry: false
      };
    }

    // 3. User Already Exists
    if (raw.includes("user already registered") || raw.includes("already exists")) {
      return {
        category: "Registration Error",
        userMessage: "An account with this email address already exists. Please sign in instead.",
        canRetry: false
      };
    }

    // 4. Timeout
    if (raw.includes("timeout") || raw.includes("took too long") || raw.includes("abort")) {
      return {
        category: "Timeout",
        userMessage: "The request took longer than expected to respond. Please try again.",
        canRetry: true
      };
    }

    // 5. File Upload / Size Limits
    if (raw.includes("size") || raw.includes("too large") || raw.includes("5mb")) {
      return {
        category: "File Size Error",
        userMessage: "Image size must be 5 MB or less. Please select a smaller photo.",
        canRetry: true
      };
    }

    if (raw.includes("format") || raw.includes("type") || raw.includes("unsupported")) {
      return {
        category: "File Type Error",
        userMessage: "Please upload a valid JPG, PNG, or WebP image.",
        canRetry: true
      };
    }

    // 6. Supabase / Database Operation Failure
    if (raw.includes("supabase") || raw.includes("database") || raw.includes("relation") || raw.includes("postgres")) {
      return {
        category: "Database Notice",
        userMessage: "Salon database is temporarily busy. Your booking is safely captured in local offline mode.",
        canRetry: true
      };
    }

    // Default Unknown
    return {
      category: "Unexpected Error",
      userMessage: "Something went wrong while processing your request. Please try again or contact our front desk.",
      canRetry: true
    };
  }
}

// --------------------------------------------------------------------------
// 7. StylePhotoUploader: Optional Hair / Style Inspiration Photo Attachment
// --------------------------------------------------------------------------
export class StylePhotoUploader {
  /**
   * Mount photo upload handler onto dropzone container
   * @param {HTMLElement} container
   * @param {Object} options
   */
  static init(container, options = {}) {
    if (!container) return null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    container.innerHTML = `
      <div class="style-upload-box">
        <label class="luxury-label" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span>Attach Hair / Style Inspiration Photo (Optional)</span>
          <span style="font-size: 0.72rem; color: var(--accent-light, #D49A7E); font-weight: 500; text-transform: uppercase;">Max 5 MB • JPG, PNG, WebP</span>
        </label>

        <!-- Dropzone -->
        <div class="style-upload-dropzone" tabindex="0" role="button" aria-label="Upload style inspiration photo. Click or drag and drop.">
          <input type="file" class="style-file-input" accept="image/jpeg,image/png,image/webp" style="display: none;">
          <div class="style-upload-icon" aria-hidden="true">📸</div>
          <div class="style-upload-prompt">Click to browse or drop reference photo here</div>
          <div class="style-upload-hint">Help our master stylists prepare your customized look</div>
        </div>

        <!-- Processing Skeleton State -->
        <div class="upload-processing-box" style="display: none;">
          <span class="ms-spinner" aria-hidden="true"></span>
          <div style="flex-grow: 1;">
            <div class="ms-skeleton ms-skeleton-text short" style="height: 14px; margin-bottom: 4px;"></div>
            <div class="ms-skeleton ms-skeleton-text" style="height: 10px; width: 40%; margin-bottom: 0;"></div>
          </div>
        </div>

        <!-- Preview State -->
        <div class="style-upload-preview" style="display: none;">
          <img src="" alt="Style Reference Preview" class="style-upload-thumb">
          <div class="style-upload-meta">
            <div class="style-upload-filename">photo.jpg</div>
            <div class="style-upload-filesize">1.2 MB • Ready to attach</div>
          </div>
          <button type="button" class="style-upload-remove-btn" aria-label="Remove photo">✕ Remove</button>
        </div>
      </div>
    `;

    const dropzone = container.querySelector(".style-upload-dropzone");
    const fileInput = container.querySelector(".style-file-input");
    const processingBox = container.querySelector(".upload-processing-box");
    const previewBox = container.querySelector(".style-upload-preview");
    const thumbImg = container.querySelector(".style-upload-thumb");
    const filenameEl = container.querySelector(".style-upload-filename");
    const filesizeEl = container.querySelector(".style-upload-filesize");
    const removeBtn = container.querySelector(".style-upload-remove-btn");

    let attachedFile = null;

    const resetState = () => {
      attachedFile = null;
      fileInput.value = "";
      dropzone.style.display = "flex";
      processingBox.style.display = "none";
      previewBox.style.display = "none";
      thumbImg.src = "";
      if (options.onChange) options.onChange(null);
    };

    const handleFile = (file) => {
      if (!file) return;

      // 1. Validate File Type
      if (!allowedTypes.includes(file.type)) {
        ToastManager.error("Please upload a JPG, PNG, or WebP image.");
        FormValidator.setFieldError(dropzone, "Unsupported format. Only JPG, PNG, and WebP photos are accepted.");
        return;
      }

      // 2. Validate File Size
      if (file.size > maxSizeBytes) {
        ToastManager.error("Image size must be 5 MB or less.");
        FormValidator.setFieldError(dropzone, "Photo exceeds 5 MB limit. Please choose a smaller image.");
        return;
      }

      FormValidator.clearFieldError(dropzone);

      // Show processing skeleton
      dropzone.style.display = "none";
      previewBox.style.display = "none";
      processingBox.style.display = "flex";

      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          attachedFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target.result
          };

          thumbImg.src = e.target.result;
          filenameEl.textContent = file.name;
          const sizeKb = (file.size / 1024).toFixed(0);
          filesizeEl.textContent = `${sizeKb} KB • Reference Photo Attached`;

          processingBox.style.display = "none";
          previewBox.style.display = "flex";

          ToastManager.success(`Reference photo "${file.name}" attached successfully.`);
          if (options.onChange) options.onChange(attachedFile);
        }, 400); // Realistic processing delay with skeleton
      };

      reader.onerror = () => {
        processingBox.style.display = "none";
        dropzone.style.display = "flex";
        ToastManager.error("Could not process the selected image. Please try another photo.");
      };

      reader.readAsDataURL(file);
    };

    // Click to browse
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });

    // File input change
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    });

    // Drag and Drop
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("is-dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("is-dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-dragover");
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFile(file);
    });

    // Remove photo
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetState();
      ToastManager.info("Style reference photo removed.");
    });

    return {
      getFile: () => attachedFile,
      reset: resetState
    };
  }
}
