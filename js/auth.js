/**
 * Magic Scissors - Client Account & Authentication System
 */
import { supabaseService } from './supabase-client.js';

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
      <button class="modal-close-btn" id="authModalClose">✕</button>
      <div class="modal-body" style="padding: 35px 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div class="logo-scissor-mark" style="margin: 0 auto 12px; width: 44px; height: 44px; font-size: 20px;">✂</div>
          <h2 class="font-serif gold-text" style="font-size: 1.8rem; margin-bottom: 6px;">Magic Scissors VIP</h2>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Access live appointment tracking and exclusive member privileges</p>
        </div>

        <!-- Auth Tabs -->
        <div style="display: flex; gap: 8px; background: #FAF8F5; border: 1px solid rgba(184, 107, 73, 0.2); padding: 4px; border-radius: var(--radius-full); margin-bottom: 25px;">
          <button id="tabBtnSignIn" class="btn ${activeTab === 'signin' ? 'btn-gold' : 'btn-outline-gold'}" style="flex: 1; padding: 8px 14px; font-size: 0.85rem; border-radius: var(--radius-full); ${activeTab === 'signin' ? 'border: none;' : ''}">
            Sign In
          </button>
          <button id="tabBtnSignUp" class="btn ${activeTab === 'signup' ? 'btn-gold' : 'btn-outline-gold'}" style="flex: 1; padding: 8px 14px; font-size: 0.85rem; border-radius: var(--radius-full); ${activeTab === 'signup' ? 'border: none;' : ''}">
            New Membership
          </button>
        </div>

        <!-- Sign In Form -->
        <div id="authSignInBox" style="display: ${activeTab === 'signin' ? 'block' : 'none'};">
          <form id="formSignIn" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="luxury-form-group">
              <label class="luxury-label">Email Address</label>
              <input type="email" name="email" class="luxury-input" required placeholder="vip@example.com">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label">Password</label>
              <input type="password" name="password" class="luxury-input" required placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-gold" style="width: 100%; margin-top: 8px; padding: 12px;">
              Sign In to Account
            </button>
          </form>
        </div>

        <!-- Sign Up Form -->
        <div id="authSignUpBox" style="display: ${activeTab === 'signup' ? 'block' : 'none'};">
          <form id="formSignUp" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="luxury-form-group">
              <label class="luxury-label">Full Name</label>
              <input type="text" name="name" class="luxury-input" required placeholder="Pooja Deshmukh">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label">Mobile Number</label>
              <input type="tel" name="phone" class="luxury-input" required placeholder="+91 99601 35849">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label">Email Address</label>
              <input type="email" name="email" class="luxury-input" required placeholder="vip@example.com">
            </div>
            <div class="luxury-form-group">
              <label class="luxury-label">Create Password</label>
              <input type="password" name="password" class="luxury-input" required placeholder="••••••••" minlength="6">
            </div>
            <button type="submit" class="btn btn-gold" style="width: 100%; margin-top: 8px; padding: 12px;">
              Create VIP Membership
            </button>
          </form>
        </div>

        <div id="authStatusMsg" style="display: none; margin-top: 15px; padding: 12px; border-radius: var(--radius-sm); text-align: center; font-size: 0.85rem;"></div>
      </div>
    `;

    // Tab switcher events
    const tabSignIn = container.querySelector("#tabBtnSignIn");
    const tabSignUp = container.querySelector("#tabBtnSignUp");
    const boxSignIn = container.querySelector("#authSignInBox");
    const boxSignUp = container.querySelector("#authSignUpBox");

    tabSignIn.addEventListener("click", () => {
      tabSignIn.className = "btn btn-gold";
      tabSignUp.className = "btn btn-glass";
      boxSignIn.style.display = "block";
      boxSignUp.style.display = "none";
    });

    tabSignUp.addEventListener("click", () => {
      tabSignUp.className = "btn btn-gold";
      tabSignIn.className = "btn btn-glass";
      boxSignUp.style.display = "block";
      boxSignIn.style.display = "none";
    });

    // Form handlers
    container.querySelector("#formSignIn")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      const res = await supabaseService.signInUser(email, password);
      if (res.success) {
        if (email.toLowerCase().includes("admin") || email.toLowerCase().includes("concierge")) {
          sessionStorage.setItem("ms_admin_auth", "true");
          window.magicScissorsApp?.conciergeDashboard?.updateVisibility();
        }
        this.updateHeaderAccountBtn();
        this.renderProfileView(res.user);
      }
    });

    container.querySelector("#formSignUp")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = e.target.name.value;
      const phone = e.target.phone.value;
      const email = e.target.email.value;
      const password = e.target.password.value;
      const res = await supabaseService.signUpUser(name, email, phone, password);
      if (res.success) {
        this.updateHeaderAccountBtn();
        this.renderProfileView(res.user);
      }
    });

    container.querySelector("#authModalClose")?.addEventListener("click", () => this.closeAuthModal());
  }

  renderProfileView(user) {
    const container = this.authModalOverlay.querySelector(".modal-container");
    const appointments = supabaseService.getLocalAppointments().filter(a => 
      a.client_phone === user.phone || a.client_email === user.email || a.client_name.toLowerCase().includes(user.name.toLowerCase().split(" ")[0])
    );

    container.innerHTML = `
      <button class="modal-close-btn" id="authModalClose">✕</button>
      <div class="modal-body" style="padding: 35px 30px;">
        <!-- Member Profile Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
          <div>
            <span class="badge-gold">${user.vip_tier}</span>
            <h2 class="font-serif gold-text" style="font-size: 1.8rem; margin: 8px 0 4px;">Welcome, ${user.name}</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">📞 ${user.phone} • ✉️ ${user.email}</p>
          </div>
          <div style="text-align: right; background: rgba(200,109,74,0.12); border: 1px solid var(--accent-primary); padding: 12px 18px; border-radius: var(--radius-md);">
            <span style="font-size: 0.72rem; letter-spacing: 0.1em; color: var(--accent-light); text-transform: uppercase;">Reward Points</span>
            <div style="font-size: 1.5rem; font-weight: 700; color: #fff;">✦ ${user.loyalty_points}</div>
          </div>
        </div>

        <!-- Appointment Tracking History -->
        <h3 class="font-serif" style="font-size: 1.25rem; margin-bottom: 16px; color: var(--accent-light);">
          Your Salon Bookings & Live Status
        </h3>

        ${appointments.length === 0 ? `
          <div style="padding: 24px; text-align: center; background: rgba(255,255,255,0.04); border-radius: var(--radius-md); color: var(--text-muted);">
            No appointments booked yet. Schedule your first luxury service below!
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px; max-height: 280px; overflow-y: auto; padding-right: 6px;">
            ${appointments.map(a => `
              <div style="padding: 14px 18px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
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

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; pt-3; border-top: 1px solid rgba(255,255,255,0.1); gap: 10px; flex-wrap: wrap;">
          <button id="authBtnSignOut" class="btn btn-glass" style="padding: 8px 18px; font-size: 0.82rem; color: #ff8888;">
            Sign Out
          </button>
          <div style="display: flex; gap: 8px; align-items: center;">
            ${(user.email && (user.email.toLowerCase().includes("admin") || user.email.toLowerCase().includes("concierge"))) ? `
              <button id="authStaffDeskBtn" class="btn btn-outline-gold" style="padding: 8px 16px; font-size: 0.82rem;">
                💼 Concierge Desk
              </button>
            ` : ''}
            <a href="#booking" id="authBookNewBtn" class="btn btn-gold" style="padding: 8px 20px; font-size: 0.88rem;">
              Book New Appointment
            </a>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#authModalClose")?.addEventListener("click", () => this.closeAuthModal());
    container.querySelector("#authBtnSignOut")?.addEventListener("click", () => {
      sessionStorage.removeItem("ms_admin_auth");
      supabaseService.signOutUser();
      this.updateHeaderAccountBtn();
      window.magicScissorsApp?.conciergeDashboard?.updateVisibility();
      this.renderAuthForm("signin");
    });
    container.querySelector("#authStaffDeskBtn")?.addEventListener("click", () => {
      this.closeAuthModal();
      window.magicScissorsApp?.conciergeDashboard?.open();
    });
    container.querySelector("#authBookNewBtn")?.addEventListener("click", () => {
      this.closeAuthModal();
    });
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
