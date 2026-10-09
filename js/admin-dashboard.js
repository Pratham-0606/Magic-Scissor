/**
 * Magic Scissors - Live Concierge & Admin Dashboard
 * Real-time appointment tracker, status management, and WhatsApp sync
 */
import { supabaseService } from './supabase-client.js';
import { ButtonLoader, ToastManager, Skeleton, EmptyState, ErrorClassifier } from './ui-feedback.js';

function escapeHTML(str) {
  if (!str) return '';
  return str.toString().replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}

export class ConciergeDashboard {
  constructor() {
    this.drawer = document.getElementById("conciergeDrawer");
    this.openBtn = document.getElementById("openConciergeBtn");
    this.filterStatus = "all";
    this.init();
  }

  async isAdmin() {
    // Determine admin securely using actual Supabase JWT app_metadata
    if (!supabaseService.isConfigured || !supabaseService.client) return false;
    try {
      const { data: { session }, error } = await supabaseService.client.auth.getSession();
      if (error || !session || !session.user) return false;
      return session.user.app_metadata?.role === 'admin';
    } catch (e) {
      return false;
    }
  }

  async updateVisibility() {
    if (!this.openBtn) return;
    if (await this.isAdmin()) {
      this.openBtn.style.display = "inline-flex";
      this.openBtn.title = "Staff Live Appointments Desk";
      const spanText = this.openBtn.querySelector("span:not(.header-badge-count)");
      if (spanText) spanText.textContent = "Staff Desk";
    } else {
      this.openBtn.style.display = "none";
    }
  }

  promptAdminPasscode() {
    ToastManager.error("Access Denied: You must be signed in as a staff member.");
    return false;
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

  async updateBadge(appointments) {
    const badge = document.getElementById("conciergePendingBadge");
    if (badge) {
      const pendingCount = appointments.filter(a => a.status === 'pending').length;
      badge.textContent = pendingCount;
      const adminStatus = await this.isAdmin();
      badge.style.display = (adminStatus && pendingCount > 0) ? "inline-flex" : "none";
    }
  }

  async open() {
    if (!this.drawer) return;
    if (!(await this.isAdmin())) {
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
          <h2 class="font-serif gold-text" style="font-size: 1.6rem; margin: 4px 0 2px;">Concierge Desk</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${connStatus.mode} • Front Desk Management</p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="conciergeLockBtn" type="button" class="btn btn-glass" style="padding: 6px 12px; font-size: 0.75rem; border-color: rgba(255,255,255,0.2);" title="Lock and exit staff mode">🔒 Lock</button>
          <button id="conciergeCloseBtn" type="button" class="modal-close-btn" style="position: static;" aria-label="Close Staff Desk">✕</button>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px;">
        <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: #fff;">${appointments.length}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">All Bookings</div>
        </div>
        <div style="background: rgba(200,109,74,0.12); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--accent-primary); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: var(--accent-light);">${appointments.filter(a => a.status === 'pending').length}</div>
          <div style="font-size: 0.72rem; color: var(--accent-light); text-transform: uppercase;">Pending Confirmation</div>
        </div>
        <div style="background: rgba(37,211,102,0.1); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(37,211,102,0.3); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: #25D366;">${appointments.filter(a => a.status === 'confirmed').length}</div>
          <div style="font-size: 0.72rem; color: #25D366; text-transform: uppercase;">Confirmed</div>
        </div>
        <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.08); text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 700; color: #b8c0ff;">${summary.whatsappClicks}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">WhatsApp Inquiries</div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px;">
        <button type="button" class="btn ${this.filterStatus === 'all' ? 'btn-gold' : 'btn-glass'} filter-btn" data-status="all" style="padding: 6px 14px; font-size: 0.8rem;">View All (${appointments.length})</button>
        <button type="button" class="btn ${this.filterStatus === 'pending' ? 'btn-gold' : 'btn-glass'} filter-btn" data-status="pending" style="padding: 6px 14px; font-size: 0.8rem;">Pending Confirmation</button>
        <button type="button" class="btn ${this.filterStatus === 'confirmed' ? 'btn-gold' : 'btn-glass'} filter-btn" data-status="confirmed" style="padding: 6px 14px; font-size: 0.8rem;">Confirmed Visits</button>
      </div>

      <!-- Appointments List Container -->
      <div id="conciergeAptList" style="display: flex; flex-direction: column; gap: 14px; max-height: calc(85vh - 280px); overflow-y: auto; padding-right: 6px;">
        ${filtered.length === 0 ? `
          <div class="ms-empty-state" style="margin: 10px 0;">
            <div class="ms-empty-icon" style="font-size: 1.3rem;">📋</div>
            <h4 class="ms-empty-title">No appointments in this view</h4>
            <p class="ms-empty-desc">There are no bookings matching the selected filter.</p>
            <button type="button" id="conciergeResetFilterBtn" class="btn btn-outline-gold" style="padding: 6px 16px; font-size: 0.8rem;">
              View All Bookings
            </button>
          </div>
        ` : filtered.map(apt => {
          const cleanPhone = apt.client_phone.replace(/[^0-9]/g, '');
          const waConfirmMsg = encodeURIComponent(`Hi ${apt.client_name}! Your appointment at Magic Scissors for "${apt.service_name}" on ${apt.preferred_date} (${apt.time_slot}) is confirmed. We look forward to seeing you.`);
          const waConfirmUrl = `https://wa.me/${cleanPhone}?text=${waConfirmMsg}`;

          return `
            <div class="glass-card" style="padding: 18px; border-color: ${apt.status === 'pending' ? 'var(--gold-border-glow)' : 'rgba(255,255,255,0.1)'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div>
                  <h4 style="color: #fff; font-size: 1.05rem; margin-bottom: 2px;">${escapeHTML(apt.client_name)}</h4>
                  <p style="color: var(--text-muted); font-size: 0.82rem;">📞 ${escapeHTML(apt.client_phone)} ${apt.client_email ? '• ✉️ ' + escapeHTML(apt.client_email) : ''}</p>
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
                <div style="color: var(--gold-light); font-weight: 600; font-size: 0.9rem;">${escapeHTML(apt.service_name)}</div>
                <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 2px;">📅 ${escapeHTML(apt.preferred_date)} • ⏰ ${escapeHTML(apt.time_slot)}</div>
                ${apt.notes ? `<div style="font-size: 0.78rem; color: #aaa; margin-top: 4px; font-style: italic;">Note: "${escapeHTML(apt.notes)}"</div>` : ''}
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <a href="${waConfirmUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="padding: 6px 14px; font-size: 0.78rem;">
                  Confirm via WhatsApp
                </a>
                <a href="tel:${cleanPhone}" class="btn btn-glass" style="padding: 6px 14px; font-size: 0.78rem;">
                  Call Client
                </a>

                ${apt.status === 'pending' ? `
                  <button type="button" class="btn btn-outline-gold status-change-btn" data-id="${apt.id}" data-new-status="confirmed" style="padding: 6px 14px; font-size: 0.78rem;">
                    Confirm Booking
                  </button>
                ` : ''}

                ${apt.status === 'confirmed' ? `
                  <button type="button" class="btn btn-glass status-change-btn" data-id="${apt.id}" data-new-status="completed" style="padding: 6px 14px; font-size: 0.78rem;">
                    Mark Completed
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join("")}
      </div>

    `;

    // Bind dynamic events inside drawer
    container.querySelector("#conciergeCloseBtn")?.addEventListener("click", () => this.close());
    container.querySelector("#conciergeLockBtn")?.addEventListener("click", () => {
      sessionStorage.removeItem("ms_admin_auth");
      this.close();
      this.updateVisibility();
      ToastManager.info("Concierge Desk locked.");
    });

    container.querySelector("#conciergeResetFilterBtn")?.addEventListener("click", () => {
      this.filterStatus = "all";
      this.render(appointments);
    });

    // Filter switching with skeleton loading
    container.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const newStatus = e.currentTarget.dataset.status;
        this.filterStatus = newStatus;
        
        const listEl = container.querySelector("#conciergeAptList");
        if (listEl) {
          Skeleton.renderAppointmentList(listEl, 3);
          setTimeout(() => {
            this.render(appointments);
          }, 150);
        } else {
          this.render(appointments);
        }
      });
    });

    // Individual button loading states for status changes
    container.querySelectorAll(".status-change-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const targetBtn = e.currentTarget;
        const id = targetBtn.dataset.id;
        const newStatus = targetBtn.dataset.newStatus;
        const loadingText = newStatus === "confirmed" ? "Confirming..." : "Completing...";

        ButtonLoader.start(targetBtn, loadingText);

        try {
          await supabaseService.updateAppointmentStatus(id, newStatus);
          ToastManager.success(`Appointment #${id} marked as ${newStatus.toUpperCase()}.`);
        } catch (err) {
          const classified = ErrorClassifier.classify(err);
          ToastManager.error(classified.userMessage, {
            retryText: "Retry",
            onRetry: () => targetBtn.click()
          });
        } finally {
          ButtonLoader.stop(targetBtn);
        }
      });
    });

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
