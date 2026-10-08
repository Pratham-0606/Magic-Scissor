/**
 * Magic Scissors - Draggable 3D Atelier Services Drum
 * A tactile, luxury 3D cylindrical drum showcasing salon categories
 * (Hair, Skin, Bridal, Nails, Men's Grooming) with smooth drag/swipe inertia,
 * keyboard accessibility, modal integration, and synchronized with the primary
 * category tabs bar.
 */

import { SALON_DATA } from '../data/salon-data.js';

export class ServicesDrumShowcase {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('services');
    this.servicesManager = options.servicesManager || null;
    this.activeFacetIndex = 0;
    this.currentRotationY = 0;
    this.targetRotationY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startRotationY = 0;
    this.velocity = 0;
    this.lastX = 0;
    this.lastTime = 0;
    this.rafId = null;
    this.isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Filter categories (exclude 'all')
    this.categories = (SALON_DATA.serviceCategories || []).filter(c => c.id !== 'all');
    this.facetCount = this.categories.length;
    this.angleStep = 360 / this.facetCount;

    this.init();
  }

  init() {
    if (!this.container) return;
    const servicesGrid = document.getElementById('servicesGrid');
    const servicesTabs = document.getElementById('servicesTabs');
    if (!servicesGrid) return;

    // Ensure primary tabs bar is always visible
    if (servicesTabs) {
      servicesTabs.style.display = 'flex';
    }

    // Inject Drum wrapper before servicesGrid
    this.drumWrapper = document.createElement('div');
    this.drumWrapper.id = 'servicesDrumWrapper';
    this.drumWrapper.className = 'services-drum-showcase';
    this.drumWrapper.setAttribute('role', 'region');
    this.drumWrapper.setAttribute('aria-roledescription', '3D category carousel');
    this.drumWrapper.setAttribute('aria-label', 'Salon Services Atelier Drum');

    // Build the Drum DOM (Single unified stage directly beneath primary tabs)
    this.drumWrapper.innerHTML = `
      <div class="services-drum-stage" id="servicesDrumStage" tabindex="0" aria-label="3D Services Drum, use Left and Right arrow keys to rotate">
        <div class="services-drum-cylinder" id="servicesDrumCylinder">
          ${this.buildFacetsHTML()}
        </div>

        <button type="button" class="drum-nav-btn drum-nav-prev" id="drumPrevBtn" aria-label="Previous Category">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button type="button" class="drum-nav-btn drum-nav-next" id="drumNextBtn" aria-label="Next Category">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <div class="drum-swipe-hint" aria-hidden="true">
          <span>‹ Drag or swipe to explore categories ›</span>
        </div>
      </div>
    `;

    // Insert above grid
    servicesGrid.parentNode.insertBefore(this.drumWrapper, servicesGrid);

    this.cacheElements();
    this.bindEvents();
    this.bindPrimaryTabsIntegration();
    this.updateDrumRadius();
    this.snapToFacet(0);

    if (window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      motionQuery.addEventListener('change', (e) => {
        this.isReducedMotion = e.matches;
      });
    }

    this.startAnimationLoop();
  }

  cacheElements() {
    this.stage = document.getElementById('servicesDrumStage');
    this.cylinder = document.getElementById('servicesDrumCylinder');
    this.prevBtn = document.getElementById('drumPrevBtn');
    this.nextBtn = document.getElementById('drumNextBtn');
    this.servicesGrid = document.getElementById('servicesGrid');
    this.servicesTabs = document.getElementById('servicesTabs');
  }

  buildFacetsHTML() {
    return this.categories.map((cat, i) => {
      const catServices = (SALON_DATA.services || []).filter(s => s.category === cat.id);
      const featured = catServices[0] || {
        id: 'signature',
        title: cat.name,
        shortDesc: 'Signature salon treatment tailored by senior stylists.',
        duration: '45 mins',
        image: 'assets/images/salon_hair_styling.jpg'
      };

      return `
        <div class="drum-facet" data-facet-index="${i}" data-category-id="${cat.id}" role="group" aria-label="${cat.name}">
          <div class="drum-card">
            <div class="drum-card-media">
              <img src="${featured.image || 'assets/images/salon_hair_styling.jpg'}" alt="${cat.name}" 
                   class="drum-card-img" loading="lazy" decoding="async"
                   onerror="this.onerror=null;this.src='assets/images/salon_hair_styling.jpg';">
              <div class="drum-card-badge">
                <span class="drum-badge-icon">${cat.icon}</span>
                <span class="drum-badge-text">${cat.name}</span>
              </div>
              <span class="drum-service-count">${catServices.length} Services</span>
            </div>

            <div class="drum-card-body">
              <h3 class="drum-card-title">${featured.title}</h3>
              <p class="drum-card-desc">${featured.shortDesc}</p>
              
              <div class="drum-card-meta">
                <span class="drum-meta-duration">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ${featured.duration}
                </span>
              </div>

              <div class="drum-card-actions">
                <button type="button" class="btn btn-primary drum-book-btn" data-service-id="${featured.id}" aria-label="Reserve ${featured.title}">
                  Book Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateDrumRadius() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const cardWidth = isMobile ? 300 : (isTablet ? 340 : 380);

    // Geometry formula for regular polygon apothem: R = (width / 2) / tan(PI / n)
    const baseRadius = (cardWidth / 2) / Math.tan(Math.PI / this.facetCount);
    this.cylinderRadius = Math.round(baseRadius * 1.05);

    const facets = this.cylinder.querySelectorAll('.drum-facet');
    facets.forEach((facet, i) => {
      const angle = i * this.angleStep;
      facet.style.transform = `rotateY(${angle}deg) translateZ(${this.cylinderRadius}px)`;
    });
  }

  bindEvents() {
    // 1. Mouse & Touch Dragging
    const onPointerDown = (e) => {
      if (e.target.closest('button, a, input, select')) return;
      this.isDragging = true;
      this.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.lastX = this.startX;
      this.lastTime = performance.now();
      this.startRotationY = this.targetRotationY;
      this.velocity = 0;
      this.stage.classList.add('is-dragging');
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const now = performance.now();
      const deltaX = clientX - this.startX;
      const dt = Math.max(1, now - this.lastTime);
      const instantVelocity = (clientX - this.lastX) / dt;

      this.velocity = instantVelocity;
      this.lastX = clientX;
      this.lastTime = now;

      // Sensitivity factor
      const dragFactor = window.innerWidth < 768 ? 0.45 : 0.35;
      this.targetRotationY = this.startRotationY + (deltaX * dragFactor);
    };

    const onPointerUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.stage.classList.remove('is-dragging');

      // Add velocity boost and snap to nearest facet
      const inertiaBoost = this.velocity * 35;
      const projectedRotation = this.targetRotationY + inertiaBoost;
      const nearestStep = Math.round(projectedRotation / this.angleStep);
      this.targetRotationY = nearestStep * this.angleStep;

      this.updateActiveIndexFromRotation(this.targetRotationY);
    };

    this.stage.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.stage.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 2. Nav buttons
    this.prevBtn?.addEventListener('click', () => this.rotateByStep(1));
    this.nextBtn?.addEventListener('click', () => this.rotateByStep(-1));

    // 3. Keyboard Arrow accessibility
    this.stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.rotateByStep(1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.rotateByStep(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.snapToFacet(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        this.snapToFacet(this.facetCount - 1);
      }
    });

    // 4. Window resize for responsive drum radius
    window.addEventListener('resize', () => this.updateDrumRadius(), { passive: true });

    // 5. Click on Service Book buttons inside drum facets
    this.cylinder.addEventListener('click', (e) => {
      const bookBtn = e.target.closest('.drum-book-btn');
      if (bookBtn) {
        const serviceId = bookBtn.dataset.serviceId;
        if (this.servicesManager && typeof this.servicesManager.openServiceModal === 'function') {
          this.servicesManager.openServiceModal(serviceId, bookBtn);
        } else {
          // Smooth scroll to booking form
          const bookingEl = document.getElementById('booking');
          if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // Bind synchronization with the primary luxury category tabs bar (#servicesTabs)
  bindPrimaryTabsIntegration() {
    if (!this.servicesTabs) return;

    const syncTabs = () => {
      const tabBtns = this.servicesTabs.querySelectorAll('.service-tab-btn');
      tabBtns.forEach(btn => {
        if (btn.dataset.drumSyncBound) return;
        btn.dataset.drumSyncBound = "true";

        btn.addEventListener('click', () => {
          const categoryId = btn.dataset.category;
          if (categoryId === 'all') {
            this.snapToFacet(0);
          } else {
            const facetIdx = this.categories.findIndex(c => c.id === categoryId);
            if (facetIdx !== -1) {
              this.snapToFacet(facetIdx);
            }
          }
        });
      });
    };

    syncTabs();

    // Observe in case ServicesManager populates or re-renders tabs
    this.tabsObserver = new MutationObserver(() => syncTabs());
    this.tabsObserver.observe(this.servicesTabs, { childList: true });
  }

  rotateByStep(direction) {
    const currentStep = Math.round(this.targetRotationY / this.angleStep);
    this.targetRotationY = (currentStep + direction) * this.angleStep;
    this.updateActiveIndexFromRotation(this.targetRotationY);
  }

  snapToFacet(index) {
    this.activeFacetIndex = Math.max(0, Math.min(this.facetCount - 1, index));
    const currentRot = this.targetRotationY;
    const targetBase = -this.activeFacetIndex * this.angleStep;
    // Find closest congruent angle
    const diff = ((targetBase - currentRot) % 360 + 540) % 360 - 180;
    this.targetRotationY = currentRot + diff;
    this.updateActiveIndicators(this.activeFacetIndex);
  }

  updateActiveIndexFromRotation(rotY) {
    // Normalise rotation into facet index [0 .. facetCount-1]
    const step = Math.round(-rotY / this.angleStep);
    this.activeFacetIndex = ((step % this.facetCount) + this.facetCount) % this.facetCount;
    this.updateActiveIndicators(this.activeFacetIndex);
  }

  updateActiveIndicators(activeIndex) {
    const activeCat = this.categories[activeIndex];

    // Synchronize primary tabs (#servicesTabs) active state
    if (this.servicesTabs && activeCat) {
      const tabBtns = this.servicesTabs.querySelectorAll('.service-tab-btn');
      tabBtns.forEach(btn => {
        const isActive = btn.dataset.category === activeCat.id;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    }

    // Update opacity & prominent depth styling of cylinder facets
    const facets = this.cylinder.querySelectorAll('.drum-facet');
    facets.forEach((facet, i) => {
      const isFront = i === activeIndex;
      facet.classList.toggle('is-front', isFront);
    });
  }

  startAnimationLoop() {
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);

      if (this.isReducedMotion) {
        this.currentRotationY = this.targetRotationY;
      } else {
        // Smooth lerp damping to target rotation
        const damp = this.isDragging ? 0.35 : 0.085;
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * damp;
      }

      if (this.cylinder) {
        this.cylinder.style.transform = `translateZ(-${this.cylinderRadius}px) rotateY(${this.currentRotationY}deg)`;
      }
    };
    loop();
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.tabsObserver) {
      this.tabsObserver.disconnect();
    }
    if (this.drumWrapper && this.drumWrapper.parentNode) {
      this.drumWrapper.parentNode.removeChild(this.drumWrapper);
    }
  }
}
