/**
 * Magic Scissors - Live Concierge & Admin Dashboard
 * Real-time appointment tracker, status management, and WhatsApp sync
 */
import { supabaseService } from './supabase-client.js';

export class ConciergeDashboard {
  constructor() {
    this.drawer = document.getElementById("conciergeDrawer");
    this.openBtn = document.getElementById("openConciergeBtn");
    this.filterStatus = "all";
    this.init();
  }

  isAdmin() {
    if (sessionStorage.getItem("ms_admin_auth") === "true") return true;

    // URL parameter or hash check: ?admin=true or #admin or #staff
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("admin") || window.location.hash.toLowerCase().includes("admin") || window.location.hash.toLowerCase().includes("staff")) {
      sessionStorage.setItem("ms_admin_auth", "true");
      return true;
    }

    // Check if authenticated user is admin/staff
    const user = supabaseService.getCurrentUser();
    if (user && (
      (user.email && (user.email.toLowerCase().includes("admin") || user.email.toLowerCase().includes("concierge"))) ||
      user.role === "admin" ||
      user.vip_tier === "Salon Admin / Concierge"
    )) {
      sessionStorage.setItem("ms_admin_auth", "true");
      return true;
    }

    return false;
  }

  updateVisibility() {
    if (!this.openBtn) return;
    if (this.isAdmin()) {
      this.openBtn.style.display = "inline-flex";
      this.openBtn.title = "Staff Live Appointments Desk";
      const spanText = this.openBtn.querySelector("span:not(.header-badge-count)");
      if (spanText) spanText.textContent = "Staff Desk";
    } else {
      this.openBtn.style.display = "none";
    }
  }

  promptAdminPasscode() {
    const code = prompt("🔒 Magic Scissors Staff Security\nEnter Admin / Concierge Access Passcode:");
    if (code === null) return false;
    if (code === "1234" || code.toLowerCase() === "admin" || code.toLowerCase() === "magicscissors") {
      sessionStorage.setItem("ms_admin_auth", "true");
      this.updateVisibility();
      return true;
    } else {
      alert("Access Denied: Incorrect staff passcode.");
      return false;
    }
  }

  init() {
    this.updateVisibility();

    if (this.openBtn) {
      this.openBtn.addEventListener("click", () => this.open());
    }

    // Subscribe to live appointment updates from Supabase / Reactive Store
    supabaseService.onAppointmentsChange((appointments) => {
      this.render(appointments);
      this.updateBadge(appointments);
    });

    this.bindDrawerEvents();
  }

  updateBadge(appointments) {
    const badge = document.getElementById("conciergePendingBadge");
    if (badge) {
      const pendingCount = appointments.filter(a => a.status === 'pending').length;
      badge.textContent = pendingCount;
      badge.style.display = (this.isAdmin() && pendingCount > 0) ? "inline-flex" : "none";
    }
  }

  open() {
    if (!this.drawer) return;
    if (!this.isAdmin()) {
      const ok = this.promptAdminPasscode();
      if (!ok) return;
    }
    this.lastFocusedElement = document.activeElement;
    this.drawer.setAttribute("role", "dialog");
    this.drawer.setAttribute("aria-modal", "true");
    this.drawer.setAttribute("aria-label", "Concierge Staff Appointments Portal");
    this.drawer.classList.add("active");
    document.body.style.overflow = "hidden";
    this.render(supabaseService.getLocalAppointments());

    setTimeout(() => {
      const closeBtn = this.drawer.querySelector("#conciergeCloseBtn");
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  close() {
    if (!this.drawer) return;
    this.drawer.classList.remove("active");
    document.body.style.overflow = "auto";
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === "function") {
      this.lastFocusedElement.focus();
    }
  }

  render(appointments) {
    if (!this.drawer) return;
    const container = this.drawer.querySelector(".concierge-content");
    const summary = supabaseService.getAnalyticsSummary();
    const connStatus = supabaseService.getConnectionStatus();

    const filtered = this.filterStatus === "all"
      ? appointments
      : appointments.filter(a => a.status === this.filterStatus);

    container.innerHTML = `
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <span class="badge-gold">${connStatus.isConfigured ? '🟢 Supabase Cloud Live' : '🟠 Offline Reactive Mode'}</span>
          <h2 class="font-serif gold-text" style="font-size: 1.6rem; margin: 4px 0 2px;">Concierge Live Desk</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${connStatus.mode} • Privileged Staff Desk</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="conciergeLockBtn" class="btn btn-glass" style="padding: 6px 12px; font-size: 0.75rem; border-color: rgba(255,255,255,0.2);" title="Lock and exit staff mode">🔒 Lock</button>
          <button id="conciergeCloseBtn" class="modal-close-btn" style="position: static;" aria-label="Close Staff Desk">✕</button>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px;">
        <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: #fff;">${appointments.length}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Total Bookings</div>
        </div>
        <div style="background: rgba(200,109,74,0.12); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--accent-primary); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: var(--accent-light);">${appointments.filter(a => a.status === 'pending').length}</div>
          <div style="font-size: 0.72rem; color: var(--accent-light); text-transform: uppercase;">Pending</div>
        </div>
        <div style="background: rgba(37,211,102,0.1); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(37,211,102,0.3); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: #25D366;">${appointments.filter(a => a.status === 'confirmed').length}</div>
          <div style="font-size: 0.72rem; color: #25D366; text-transform: uppercase;">Confirmed</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: #b8c0ff;">${summary.whatsappClicks}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">WA Clicks</div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px;">
        <button class="btn ${this.filterStatus === 'all' ? 'btn-gold' : 'btn-glass'} filter-btn" data-status="all" style="padding: 6px 14px; font-size: 0.8rem;">All (${appointments.length})</button>
        <button class="btn ${this.filterStatus === 'pending' ? 'btn-gold' : 'btn-glass'} filter-btn" data-status="pending" style="padding: 6px 14px; font-size: 0.8rem;">Pending</button>
        <button class="btn ${this.filterStatus === 'confirmed' ? 'btn-gold' : 'btn-glass'} filter-btn" data-status="confirmed" style="padding: 6px 14px; font-size: 0.8rem;">Confirmed</button>
      </div>

      <!-- Appointments List -->
      <div style="display: flex; flex-direction: column; gap: 14px; max-height: calc(85vh - 280px); overflow-y: auto; padding-right: 6px;">
        ${filtered.length === 0 ? `
          <div style="padding: 30px; text-align: center; color: var(--text-muted); background: rgba(255,255,255,0.03); border-radius: var(--radius-md);">
            No appointments matching this filter.
          </div>
        ` : filtered.map(apt => {
          const cleanPhone = apt.client_phone.replace(/[^0-9]/g, '');
          const waConfirmMsg = encodeURIComponent(`Hi ${apt.client_name}! Your appointment at Magic Scissors for "${apt.service_name}" on ${apt.preferred_date} (${apt.time_slot}) is CONFIRMED. We look forward to welcoming you!`);
          const waConfirmUrl = `https://wa.me/${cleanPhone}?text=${waConfirmMsg}`;

          return `
            <div class="glass-card" style="padding: 18px; border-color: ${apt.status === 'pending' ? 'var(--gold-border-glow)' : 'rgba(255,255,255,0.1)'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div>
                  <h4 style="color: #fff; font-size: 1.05rem; margin-bottom: 2px;">${apt.client_name}</h4>
                  <p style="color: var(--text-muted); font-size: 0.82rem;">📞 ${apt.client_phone} ${apt.client_email ? '• ✉️ ' + apt.client_email : ''}</p>
                </div>
                <span class="badge-gold" style="
                  ${apt.status === 'confirmed' ? 'background: rgba(37,211,102,0.2); border-color: #25D366; color: #a3ffc8;' : ''}
                  ${apt.status === 'pending' ? 'background: rgba(200,109,74,0.2); border-color: var(--accent-primary); color: var(--accent-light);' : ''}
                  ${apt.status === 'completed' ? 'background: rgba(100,100,255,0.2); border-color: #646cff; color: #b8c0ff;' : ''}
                ">
                  ● ${apt.status.toUpperCase()}
                </span>
              </div>

              <div style="background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 12px;">
                <div style="color: var(--gold-light); font-weight: 600; font-size: 0.9rem;">${apt.service_name}</div>
                <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">📅 ${apt.preferred_date} • ⏰ ${apt.time_slot}</div>
                ${apt.notes ? `<div style="font-size: 0.78rem; color: #aaa; margin-top: 4px; font-style: italic;">Note: "${apt.notes}"</div>` : ''}
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <a href="${waConfirmUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="padding: 6px 14px; font-size: 0.78rem;">
                  WhatsApp Confirm
                </a>
                <a href="tel:${cleanPhone}" class="btn btn-glass" style="padding: 6px 14px; font-size: 0.78rem;">
                  Direct Call
                </a>

                ${apt.status === 'pending' ? `
                  <button class="btn btn-outline-gold status-change-btn" data-id="${apt.id}" data-new-status="confirmed" style="padding: 6px 14px; font-size: 0.78rem;">
                    ✓ Mark Confirmed
                  </button>
                ` : ''}

                ${apt.status === 'confirmed' ? `
                  <button class="btn btn-glass status-change-btn" data-id="${apt.id}" data-new-status="completed" style="padding: 6px 14px; font-size: 0.78rem;">
                    ★ Mark Completed
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- Supabase Setup Footer & Project Key Helper -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          Status: <strong style="color: ${supabaseService.isConfigured ? '#25D366' : 'var(--gold-light)'};">
            ${supabaseService.isConfigured ? '● Connected to Supabase Cloud' : '● Reactive Offline-First Mode'}
          </strong>
        </span>
        <button id="toggleSupabaseSettingsBtn" style="background: none; border: none; color: var(--gold-light); font-size: 0.78rem; cursor: pointer; text-decoration: underline;">
          Configure Supabase Keys
        </button>
      </div>

      <!-- Config Inputs (Collapsible) -->
      <div id="supabaseConfigBox" style="display: none; margin-top: 15px; padding: 14px; background: rgba(0,0,0,0.5); border-radius: var(--radius-sm); border: 1px solid var(--gold-border);">
        <label style="font-size: 0.78rem; color: var(--gold-light);">Supabase Project URL</label>
        <input type="text" id="cfgSupabaseUrl" placeholder="https://xyzcompany.supabase.co" style="width: 100%; padding: 8px 12px; margin: 4px 0 10px; background: #111; border: 1px solid #333; color: #fff; border-radius: 4px; font-size: 0.8rem;">
        
        <label style="font-size: 0.78rem; color: var(--gold-light);">Supabase Anon Public Key</label>
        <input type="text" id="cfgSupabaseKey" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." style="width: 100%; padding: 8px 12px; margin: 4px 0 10px; background: #111; border: 1px solid #333; color: #fff; border-radius: 4px; font-size: 0.8rem;">
        
        <button id="saveSupabaseKeysBtn" class="btn btn-gold" style="width: 100%; padding: 8px; font-size: 0.82rem;">
          Save & Connect Supabase
        </button>
      </div>
    `;

    // Bind dynamic events inside drawer
    container.querySelector("#conciergeCloseBtn")?.addEventListener("click", () => this.close());
    container.querySelector("#conciergeLockBtn")?.addEventListener("click", () => {
      sessionStorage.removeItem("ms_admin_auth");
      this.close();
      this.updateVisibility();
    });

    container.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        this.filterStatus = e.currentTarget.dataset.status;
        this.render(appointments);
      });
    });

    container.querySelectorAll(".status-change-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        const newStatus = e.currentTarget.dataset.newStatus;
        await supabaseService.updateAppointmentStatus(id, newStatus);
      });
    });

    const toggleBtn = container.querySelector("#toggleSupabaseSettingsBtn");
    const cfgBox = container.querySelector("#supabaseConfigBox");
    if (toggleBtn && cfgBox) {
      toggleBtn.addEventListener("click", () => {
        cfgBox.style.display = cfgBox.style.display === "none" ? "block" : "none";
      });
    }

    const saveBtn = container.querySelector("#saveSupabaseKeysBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const url = container.querySelector("#cfgSupabaseUrl").value.trim();
        const key = container.querySelector("#cfgSupabaseKey").value.trim();
        if (url && key) {
          supabaseService.setCredentials(url, key);
          alert("✓ Supabase credentials saved! Connecting to cloud database.");
          this.render(supabaseService.getLocalAppointments());
        }
      });
    }
  }

  bindDrawerEvents() {
    this.drawer?.addEventListener("click", (e) => {
      if (e.target === this.drawer) this.close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.drawer?.classList.contains("active")) {
        this.close();
      }

      // Staff secret shortcut: Ctrl + Shift + L or Ctrl + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === "l" || e.key.toLowerCase() === "a")) {
        e.preventDefault();
        if (this.drawer?.classList.contains("active")) {
          this.close();
        } else {
          this.open();
        }
      }
    });

    window.addEventListener("hashchange", () => {
      this.updateVisibility();
    });
  }
}
