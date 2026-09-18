/**
 * Magic Scissors - Client Account & Authentication System
 */
import { supabaseService } from './supabase-client.js';
import { ButtonLoader, FormValidator, ToastManager, Skeleton, EmptyState, ErrorClassifier } from './ui-feedback.js';

export class AuthManager {
  constructor() {
    this.authModalOverlay = document.getElementById("authModalOverlay");
    this.accountBtn = document.getElementById("headerAccountBtn");
    this.init();
  }

  init() {
    this.updateHeaderAccountBtn();
    this.bindEvents();
  }

  updateHeaderAccountBtn() {
    if (!this.accountBtn) return;
    const user = supabaseService.getCurrentUser();
    if (user) {
      this.accountBtn.innerHTML = `
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #25D366;"></span>
        <span>${user.name.split(" ")[0]}'s Account</span>
      `;
      this.accountBtn.classList.add("btn-gold");
      this.accountBtn.classList.remove("btn-glass");
    } else {
      this.accountBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Sign In</span>
      `;
      this.accountBtn.classList.add("btn-glass");
      this.accountBtn.classList.remove("btn-gold");
    }
  }

  openAuthModal(defaultTab = "signin") {
    if (!this.authModalOverlay) return;
    this.lastFocusedElement = document.activeElement;
    this.authModalOverlay.setAttribute("role", "dialog");
    this.authModalOverlay.setAttribute("aria-modal", "true");
    this.authModalOverlay.setAttribute("aria-label", "VIP Membership and Account Access");

    const user = supabaseService.getCurrentUser();

    if (user) {
      this.renderProfileView(user);
    } else {
      this.renderAuthForm(defaultTab);
    }

    this.authModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const closeBtn = this.authModalOverlay.querySelector("#authModalClose");
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  closeAuthModal() {
    if (!this.authModalOverlay) return;
    this.authModalOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === "function") {
      this.lastFocusedElement.focus();
    }
  }

  renderAuthForm(activeTab = "signin") {
    const container = this.authModalOverlay.querySelector(".modal-container");
    container.innerHTML = `
      <button class="modal-close-btn" id="authModalClose" aria-label="Close dialog">✕</button>
      <div class="modal-body" style="padding: 35px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div class="logo-scissor-mark" style="margin: 0 auto 12px; width: 44px; height: 44px; font-size: 20px;">✂</div>
          <h2 class="font-serif gold-text" style="font-size: 1.8rem; margin-bottom: 6px;">Magic Scissors VIP</h2>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Enjoy priority booking, appointment tracking, and exclusive member privileges.</p>
        </div>

        <!-- Auth Tabs -->
        <div style="display: flex; gap: 8px; background: #FAF8F5; border: 1px solid rgba(184, 107, 73, 0.2); padding: 4px; border-radius: var(--radius-full); margin-bottom: 25px;">
          <button id="tabBtnSignIn" type="button" class="btn ${activeTab === 'signin' ? 'btn-gold' : 'btn-outline-gold'}" style="flex: 1; padding: 8px 14px; font-size: 0.85rem; border-radius: var(--radius-full); ${activeTab === 'signin' ? 'border: none;' : ''}">
            Sign In
          </button>
          <button id="tabBtnSignUp" type="button" class="btn ${activeTab === 'signup' ? 'btn-gold' : 'btn-outline-gold'}" style="flex: 1; padding: 8px 14px; font-size: 0.85rem; border-radius: var(--radius-full); ${activeTab === 'signup' ? 'border: none;' : ''}">
            Join VIP
          </button>
        </div>

        <!-- Sign In Form -->
        <div id="authSignInBox" style="display: ${activeTab === 'signin' ? 'block' : 'none'};">
          <form id="formSignIn" style="display: flex; flex-direction: column; gap: 16px;" novalidate>
            <div class="luxury-form-group">
              <label class="luxury-label" for="signInEmail">Email Address</label>
              <input type="email" id="signInEmail" name="email" class="luxury-input" placeholder="vip@example.com" autocomplete="email">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label" for="signInPassword">Password</label>
              <input type="password" id="signInPassword" name="password" class="luxury-input" placeholder="••••••••" autocomplete="current-password">
            </div>
            <button type="submit" id="btnSignInSubmit" class="btn btn-gold" style="width: 100%; margin-top: 8px; padding: 12px;">
              Sign In
            </button>
          </form>
        </div>

        <!-- Sign Up Form -->
        <div id="authSignUpBox" style="display: ${activeTab === 'signup' ? 'block' : 'none'};">
          <form id="formSignUp" style="display: flex; flex-direction: column; gap: 14px;" novalidate>
            <div class="luxury-form-group">
              <label class="luxury-label" for="signUpName">Full Name</label>
              <input type="text" id="signUpName" name="name" class="luxury-input" placeholder="Pooja Deshmukh" autocomplete="name">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label" for="signUpPhone">Mobile Number</label>
              <input type="tel" id="signUpPhone" name="phone" class="luxury-input" placeholder="+91 99601 35849" autocomplete="tel">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label" for="signUpEmail">Email Address</label>
              <input type="email" id="signUpEmail" name="email" class="luxury-input" placeholder="vip@example.com" autocomplete="email">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label" for="signUpPassword">Create Password</label>
              <input type="password" id="signUpPassword" name="password" class="luxury-input" placeholder="••••••••" autocomplete="new-password">
            </div>
            <button type="submit" id="btnSignUpSubmit" class="btn btn-gold" style="width: 100%; margin-top: 8px; padding: 12px;">
              Create VIP Account
            </button>
          </form>
        </div>

        <!-- Inline Status & Feedback Banner -->
        <div id="authStatusMsg" style="display: none; margin-top: 18px; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; line-height: 1.4;"></div>
      </div>
    `;

    // Tab switcher events
    const tabSignIn = container.querySelector("#tabBtnSignIn");
    const tabSignUp = container.querySelector("#tabBtnSignUp");
    const boxSignIn = container.querySelector("#authSignInBox");
    const boxSignUp = container.querySelector("#authSignUpBox");
    const statusMsg = container.querySelector("#authStatusMsg");

    const clearStatus = () => {
      if (statusMsg) {
        statusMsg.style.display = "none";
        statusMsg.innerHTML = "";
      }
    };

    tabSignIn.addEventListener("click", () => {
      clearStatus();
      tabSignIn.className = "btn btn-gold";
      tabSignIn.style.border = "none";
      tabSignUp.className = "btn btn-outline-gold";
      boxSignIn.style.display = "block";
      boxSignUp.style.display = "none";
    });

    tabSignUp.addEventListener("click", () => {
      clearStatus();
      tabSignUp.className = "btn btn-gold";
      tabSignUp.style.border = "none";
      tabSignIn.className = "btn btn-outline-gold";
      boxSignUp.style.display = "block";
      boxSignIn.style.display = "none";
    });

    const showAuthError = (msg) => {
      if (!statusMsg) return;
      statusMsg.style.display = "block";
      statusMsg.style.background = "#FEF2F2";
      statusMsg.style.border = "1px solid rgba(220, 38, 38, 0.3)";
      statusMsg.style.color = "#DC2626";
      statusMsg.innerHTML = `<strong>⚠️ Notice:</strong> ${msg}`;
    };

    // Sign In handler with validation & loading
    container.querySelector("#formSignIn")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearStatus();
      const form = e.target;
      FormValidator.clearAllErrors(form);

      const email = form.email.value.trim();
      const password = form.password.value;
      const submitBtn = form.querySelector("#btnSignInSubmit");

      let hasError = false;
      if (!email) {
        FormValidator.setFieldError(form.email, "Please enter your email address.");
        hasError = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        FormValidator.setFieldError(form.email, "Please enter a valid email address.");
        hasError = true;
      }

      if (!password) {
        FormValidator.setFieldError(form.password, "Please enter your password.");
        hasError = true;
      }

      if (hasError) return;

      ButtonLoader.start(submitBtn, "Signing in...");

      try {
        const res = await supabaseService.signInUser(email, password);
        if (res && res.success) {
          ToastManager.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
          if (email.toLowerCase().includes("admin") || email.toLowerCase().includes("concierge")) {
            sessionStorage.setItem("ms_admin_auth", "true");
            window.magicScissorsApp?.conciergeDashboard?.updateVisibility();
          }
          this.updateHeaderAccountBtn();
          this.renderProfileView(res.user);
        } else {
          showAuthError("Invalid credentials. Please verify your email and password.");
        }
      } catch (err) {
        const classified = ErrorClassifier.classify(err);
        showAuthError(classified.userMessage);
        ToastManager.error(classified.userMessage);
      } finally {
        ButtonLoader.stop(submitBtn);
      }
    });

    // Sign Up handler with validation & loading
    container.querySelector("#formSignUp")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearStatus();
      const form = e.target;
      FormValidator.clearAllErrors(form);

      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const submitBtn = form.querySelector("#btnSignUpSubmit");

      let hasError = false;
      if (!name || name.length < 2) {
        FormValidator.setFieldError(form.name, "Please enter your full name.");
        hasError = true;
      }

      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (!phone || cleanPhone.length < 10) {
        FormValidator.setFieldError(form.phone, "Please enter a valid 10-digit mobile number.");
        hasError = true;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        FormValidator.setFieldError(form.email, "Please enter a valid email address.");
        hasError = true;
      }

      if (!password || password.length < 6) {
        FormValidator.setFieldError(form.password, "Password must be at least 6 characters.");
        hasError = true;
      }

      if (hasError) return;

      ButtonLoader.start(submitBtn, "Creating account...");

      try {
        const res = await supabaseService.signUpUser(name, email, phone, password);
        if (res && res.success) {
          ToastManager.success(`Account created. Welcome to Magic Scissors, ${res.user.name.split(" ")[0]}!`);
          this.updateHeaderAccountBtn();
          this.renderProfileView(res.user);
        } else {
          showAuthError("Unable to create account. Please check your information and try again.");
        }
      } catch (err) {
        const classified = ErrorClassifier.classify(err);
        showAuthError(classified.userMessage);
        ToastManager.error(classified.userMessage);
      } finally {
        ButtonLoader.stop(submitBtn);
      }
    });

    container.querySelector("#authModalClose")?.addEventListener("click", () => this.closeAuthModal());
  }

  renderProfileView(user) {
    const container = this.authModalOverlay.querySelector(".modal-container");
    
    // 1. Show high-fidelity Profile Skeleton while fetching/preparing details
    Skeleton.renderProfile(container);

    setTimeout(() => {
      const appointments = supabaseService.getLocalAppointments().filter(a => 
        a.client_phone === user.phone || a.client_email === user.email || a.client_name.toLowerCase().includes(user.name.toLowerCase().split(" ")[0])
      );

      container.innerHTML = `
        <button class="modal-close-btn" id="authModalClose" aria-label="Close profile">✕</button>
        <div class="modal-body" style="padding: 35px 30px;">
          <!-- Member Profile Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
            <div>
              <span class="badge-gold">${user.vip_tier}</span>
              <h2 class="font-serif gold-text" style="font-size: 1.8rem; margin: 8px 0 4px;">Welcome, ${user.name}</h2>
              <p style="color: var(--text-muted); font-size: 0.85rem;">📞 ${user.phone} • ✉️ ${user.email}</p>
            </div>
            <div style="text-align: right; background: rgba(200,109,74,0.12); border: 1px solid var(--accent-primary); padding: 12px 18px; border-radius: var(--radius-md);">
              <span style="font-size: 0.72rem; letter-spacing: 0.1em; color: var(--accent-light); text-transform: uppercase;">Reward Points</span>
              <div style="font-size: 1.5rem; font-weight: 700; color: #fff;">✦ ${user.loyalty_points || 250}</div>
            </div>
          </div>

          <!-- Appointment Tracking History -->
          <h3 class="font-serif" style="font-size: 1.25rem; margin-bottom: 16px; color: var(--accent-light);">
            Your Appointments
          </h3>

          <div id="profileAppointmentsContainer">
            ${appointments.length === 0 ? `
              <div class="ms-empty-state" style="padding: 28px 16px; margin: 8px 0;">
                <div class="ms-empty-icon" style="width: 44px; height: 44px; font-size: 1.2rem; margin-bottom: 10px;">📅</div>
                <h4 class="ms-empty-title" style="font-size: 1.05rem; margin-bottom: 4px;">No appointments scheduled</h4>
                <p class="ms-empty-desc" style="font-size: 0.82rem; margin-bottom: 14px;">Book your next visit with our stylists.</p>
                <a href="#booking" id="emptyBookNowBtn" class="btn btn-gold" style="padding: 6px 18px; font-size: 0.82rem;">
                  Book an Appointment
                </a>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 12px; max-height: 280px; overflow-y: auto; padding-right: 6px;">
                ${appointments.map(a => `
                  <div style="padding: 14px 18px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <div>
                      <h5 style="color: #fff; font-size: 0.95rem; margin-bottom: 4px;">${a.service_name}</h5>
                      <p style="color: var(--text-muted); font-size: 0.8rem;">📅 ${a.preferred_date} • ⏰ ${a.time_slot}</p>
                    </div>
                    <span class="badge-gold" style="
                      ${a.status === 'confirmed' ? 'background: rgba(37,211,102,0.2); border-color: #25D366; color: #a3ffc8;' : ''}
                      ${a.status === 'pending' ? 'background: rgba(200,109,74,0.2); border-color: var(--accent-primary); color: var(--accent-light);' : ''}
                      ${a.status === 'completed' ? 'background: rgba(100,100,255,0.2); border-color: #646cff; color: #b8c0ff;' : ''}
                    ">
                      ● ${a.status.toUpperCase()}
                    </span>
                  </div>
                `).join("")}
              </div>
            `}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); gap: 10px; flex-wrap: wrap;">
            <button id="authBtnSignOut" type="button" class="btn btn-glass" style="padding: 8px 18px; font-size: 0.82rem; color: #ff8888;">
              Sign Out
            </button>
            <div style="display: flex; gap: 8px; align-items: center;">
              ${(user.email && (user.email.toLowerCase().includes("admin") || user.email.toLowerCase().includes("concierge"))) ? `
                <button id="authStaffDeskBtn" type="button" class="btn btn-outline-gold" style="padding: 8px 16px; font-size: 0.82rem;">
                  Concierge Desk
                </button>
              ` : ''}
              <a href="#booking" id="authBookNewBtn" class="btn btn-gold" style="padding: 8px 20px; font-size: 0.88rem;">
                Book an Appointment
              </a>
            </div>
          </div>
        </div>
      `;

      container.querySelector("#authModalClose")?.addEventListener("click", () => this.closeAuthModal());
      container.querySelector("#emptyBookNowBtn")?.addEventListener("click", () => this.closeAuthModal());
      container.querySelector("#authBookNewBtn")?.addEventListener("click", () => this.closeAuthModal());
      
      container.querySelector("#authBtnSignOut")?.addEventListener("click", () => {
        sessionStorage.removeItem("ms_admin_auth");
        supabaseService.signOutUser();
        this.updateHeaderAccountBtn();
        ToastManager.info("You have been signed out.");
        window.magicScissorsApp?.conciergeDashboard?.updateVisibility();
        this.renderAuthForm("signin");
      });

      container.querySelector("#authStaffDeskBtn")?.addEventListener("click", () => {
        this.closeAuthModal();
        window.magicScissorsApp?.conciergeDashboard?.open();
      });
    }, 160);
  }

  bindEvents() {
    this.accountBtn?.addEventListener("click", () => this.openAuthModal());

    this.authModalOverlay?.addEventListener("click", (e) => {
      if (e.target === this.authModalOverlay) this.closeAuthModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.authModalOverlay?.classList.contains("active")) {
        this.closeAuthModal();
      }
    });
  }
}
