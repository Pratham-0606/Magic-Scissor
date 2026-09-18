/**
 * Magic Scissors - Interactive Services & Service Modal Controller
 */
import { SALON_DATA } from './data/salon-data.js';
import { Skeleton, EmptyState, ToastManager } from './ui-feedback.js';

export class ServicesManager {
  constructor() {
    this.servicesContainer = document.getElementById("servicesGrid");
    this.tabsContainer = document.getElementById("servicesTabs");
    this.modalOverlay = document.getElementById("serviceModalOverlay");
    this.currentCategory = "all";
    this.lastFocusedElement = null;
    this.renderTimeout = null;

    this.init();
  }

  init() {
    if (this.modalOverlay) {
      this.modalOverlay.setAttribute("role", "dialog");
      this.modalOverlay.setAttribute("aria-modal", "true");
    }
    this.renderTabs();
    this.renderServices(this.currentCategory);
    this.bindModalEvents();
  }

  renderTabs() {
    if (!this.tabsContainer) return;
    this.tabsContainer.setAttribute("role", "tablist");
    this.tabsContainer.setAttribute("aria-label", "Service Categories");

    this.tabsContainer.innerHTML = SALON_DATA.serviceCategories.map(cat => `
      <button class="service-tab-btn ${cat.id === this.currentCategory ? 'active' : ''}" 
              data-category="${cat.id}"
              role="tab"
              aria-selected="${cat.id === this.currentCategory ? 'true' : 'false'}"
              tabindex="${cat.id === this.currentCategory ? '0' : '-1'}">
        <span>${cat.icon}</span>
        <span>${cat.name}</span>
      </button>
    `).join("");

    const tabs = Array.from(this.tabsContainer.querySelectorAll(".service-tab-btn"));

    tabs.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        this.selectTab(btn.dataset.category, btn);
      });

      // Keyboard arrow navigation for tabs
      btn.addEventListener("keydown", (e) => {
        let nextIdx = null;
        if (e.key === "ArrowRight") {
          nextIdx = (idx + 1) % tabs.length;
        } else if (e.key === "ArrowLeft") {
          nextIdx = (idx - 1 + tabs.length) % tabs.length;
        }
        if (nextIdx !== null) {
          e.preventDefault();
          tabs[nextIdx].focus();
          this.selectTab(tabs[nextIdx].dataset.category, tabs[nextIdx]);
        }
      });
    });
  }

  selectTab(cat, tabBtn) {
    if (this.tabsContainer) {
      this.tabsContainer.querySelectorAll(".service-tab-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
        b.setAttribute("tabindex", "-1");
      });
      if (tabBtn) {
        tabBtn.classList.add("active");
        tabBtn.setAttribute("aria-selected", "true");
        tabBtn.setAttribute("tabindex", "0");
      }
    }
    this.currentCategory = cat;
    this.renderServices(cat);
  }

  renderServices(category) {
    if (!this.servicesContainer) return;

    if (this.renderTimeout) clearTimeout(this.renderTimeout);

    // 1. Show high-fidelity skeletons matching service cards
    Skeleton.renderServiceGrid(this.servicesContainer, 6);

    // 2. Smooth transition into content
    this.renderTimeout = setTimeout(() => {
      try {
        const filtered = category === "all" 
          ? SALON_DATA.services 
          : SALON_DATA.services.filter(s => s.category === category);

        if (!filtered || filtered.length === 0) {
          EmptyState.render(this.servicesContainer, {
            icon: "✂️",
            title: "No Services in This Category",
            description: "No services found in this category. Please explore our full service menu.",
            actionText: "View All Services",
            onAction: () => {
              const allTab = this.tabsContainer?.querySelector('[data-category="all"]');
              this.selectTab("all", allTab);
            }
          });
          return;
        }

        const isAll = category === "all";
        this.servicesContainer.innerHTML = filtered.map((item, idx) => {
          const isFeatured = isAll && idx === 0;
          return `
            <article class="service-card glass-card ${isFeatured ? 'featured' : ''}" data-service-id="${item.id}">
              <div class="service-card-media">
                <img src="${item.image}" alt="${item.title}" class="service-card-img"
                     loading="${isFeatured ? 'eager' : 'lazy'}"
                     decoding="async"
                     ${isFeatured ? 'fetchpriority="high"' : ''}
                     onload="this.classList.add('is-loaded')"
                     onerror="this.onerror=null;this.src='assets/images/salon_hair_styling.jpg';this.classList.add('is-loaded');">
                <span class="service-card-tag">${item.tag}</span>
              </div>
              <div class="service-card-body">
                <div>
                  <h3 class="service-card-title">${item.title}</h3>
                  <p class="service-card-desc">${item.shortDesc}</p>
                </div>
                <div class="service-meta-row">
                  <span class="service-duration">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${item.duration}
                  </span>
                  <button class="btn btn-outline-gold btn-sm view-service-btn" style="padding: 8px 18px; font-size: 0.82rem;" data-service-id="${item.id}">
                    View & Book
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join("");

        // Attach click listeners on cards & buttons
        this.servicesContainer.querySelectorAll(".service-card").forEach(card => {
          card.addEventListener("click", (e) => {
            const serviceId = card.dataset.serviceId;
            this.openServiceModal(serviceId, e.currentTarget);
          });
        });
      } catch (err) {
        console.error("Error loading services:", err);
        EmptyState.render(this.servicesContainer, {
          icon: "⚠️",
          title: "Unable to Load Services",
          description: "Something went wrong while loading salon services. Please try again.",
          actionText: "Try Again",
          onAction: () => this.renderServices(this.currentCategory)
        });
        ToastManager.error("Something went wrong while loading services.", {
          retryText: "Try Again",
          onRetry: () => this.renderServices(this.currentCategory)
        });
      }
    }, 180);
  }

  openServiceModal(serviceId, triggerEl = null) {
    const service = SALON_DATA.services.find(s => s.id === serviceId);
    if (!service || !this.modalOverlay) return;

    this.lastFocusedElement = triggerEl || document.activeElement;

    const modalContainer = this.modalOverlay.querySelector(".modal-container");
    this.modalOverlay.setAttribute("aria-labelledby", "serviceModalTitle");

    const waText = encodeURIComponent(`Hi! I'd like to book "${service.title}" (${service.price}). What slots do you have available?`);
    const waUrl = `https://wa.me/${SALON_DATA.brand.whatsappClean}?text=${waText}`;
    const telUrl = `tel:${SALON_DATA.brand.phoneClean}`;

    modalContainer.innerHTML = `
      <button class="modal-close-btn" id="modalCloseBtn" aria-label="Close dialog">✕</button>
      <div class="modal-banner-wrap" style="position: relative; width: 100%; height: 260px; overflow: hidden;">
        <img src="${service.image}" alt="${service.title}" class="modal-banner-image"
             loading="eager" decoding="async"
             style="width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.35s ease;"
             onload="this.style.opacity='1'"
             onerror="this.onerror=null;this.src='assets/images/salon_hair_styling.jpg';this.style.opacity='1';">
      </div>
      
      <div class="modal-body">
        <div class="modal-header-info">
          <div>
            <span class="badge-gold mb-2">${service.categoryName} • ${service.tag}</span>
            <h2 class="modal-title font-serif" id="serviceModalTitle">${service.title}</h2>
          </div>
        </div>

        <p style="color: var(--text-secondary); font-size: 0.98rem; line-height: 1.7; margin-bottom: 20px;">
          ${service.fullDesc}
        </p>

        <!-- Service Procedure Steps -->
        <h4 class="modal-section-title">
          <span>✧</span> Service Steps
        </h4>
        <ul class="modal-steps-list">
          ${service.steps.map((step, idx) => `
            <li class="modal-step-item">
              <span class="modal-step-num">${idx + 1}</span>
              <span>${step}</span>
            </li>
          `).join("")}
        </ul>

        <!-- Key Benefits -->
        <h4 class="modal-section-title">
          <span>✧</span> Key Benefits
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${service.benefits.map(b => `
            <span class="badge-gold" style="font-size: 0.8rem; text-transform: none; padding: 6px 14px;">
              ✓ ${b}
            </span>
          `).join("")}
        </div>

        <!-- Premium Products Used -->
        <h4 class="modal-section-title">
          <span>✧</span> Products Used
        </h4>
        <div class="modal-products-strip">
          ${service.products.map(p => `<span class="modal-product-tag">${p}</span>`).join("")}
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions-footer">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="flex: 1.2;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.18-.553-1.631-.676-2.731-2.316-2.812-2.424-.082-.108-.66-8.79-.66-1.682 0-.802.417-1.196.565-1.356.148-.16.324-.2.433-.2.11 0 .219.002.312.008.102.006.236-.041.368.277.144.348.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.187-.174.289-.088.102-.185.228-.264.306-.09.088-.184.184-.079.364.105.18.468.772.998 1.246.684.61 1.258.8 1.439.89.18.089.286.076.393-.047.108-.124.465-.544.59-.73.125-.187.25-.156.417-.094.167.062 1.059.5 1.241.59.182.09.303.136.348.212.046.078.046.452-.098.857z"/>
            </svg>
            Book via WhatsApp
          </a>

          <a href="${telUrl}" class="btn btn-call" style="flex: 1;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Call Front Desk
          </a>

          <button class="btn btn-outline-gold select-in-form-btn" data-service-title="${service.title}" style="flex: 1;">
            Fill Booking Form
          </button>
        </div>
      </div>
    `;

    this.modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Focus close button on open
    const closeBtn = modalContainer.querySelector("#modalCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeServiceModal());
      setTimeout(() => closeBtn.focus(), 50);
    }

    const reserveBtn = modalContainer.querySelector(".select-in-form-btn");
    if (reserveBtn) {
      reserveBtn.addEventListener("click", () => {
        this.closeServiceModal();
        const bookingSection = document.getElementById("bookingSection");
        const serviceSelect = document.getElementById("bookingServiceSelect");
        if (bookingSection && serviceSelect) {
          serviceSelect.value = service.id;
          bookingSection.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = `contact.html?service=${encodeURIComponent(service.id)}`;
        }
      });
    }

    this.setupFocusTrap(modalContainer);
  }

  setupFocusTrap(container) {
    if (!container) return;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    container.onkeydown = (e) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(container.querySelectorAll(focusableSelectors)).filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
  }

  closeServiceModal() {
    if (!this.modalOverlay) return;
    this.modalOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === "function") {
      this.lastFocusedElement.focus();
    }
  }

  bindModalEvents() {
    if (!this.modalOverlay) return;

    this.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.modalOverlay) {
        this.closeServiceModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modalOverlay.classList.contains("active")) {
        this.closeServiceModal();
      }
    });
  }
}
