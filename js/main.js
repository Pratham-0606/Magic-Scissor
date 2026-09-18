/**
 * Magic Scissors - Main Application Core (Supabase Enhanced)
 */
import './cinema-ambient.js';
import { SALON_DATA } from './data/salon-data.js';
import { ServicesManager } from './services.js';
import { supabaseService } from './supabase-client.js';
import { AuthManager } from './auth.js';
import { ConciergeDashboard } from './admin-dashboard.js';

class MagicScissorsApp {
  constructor() {
    this.servicesMgr = null;
    this.authMgr = null;
    this.conciergeDashboard = null;
    this.currentGalleryFilter = "all";
    this.init();
  }

  init() {
    // 1. Initialize core services & managers
    this.servicesMgr = new ServicesManager();
    this.authMgr = new AuthManager();
    this.conciergeDashboard = new ConciergeDashboard();

    // 2. Render salon gallery
    this.renderGallery();

    // 3. Render packages
    this.renderPackages();

    // 4. Render testimonials
    this.renderTestimonials();

    // 5. Populate booking select dropdown
    this.populateBookingSelect();

    // 6. Setup general interactions (header, ripples, mobile drawer, video, form, analytics tracking)
    this.setupHeaderScroll();
    this.setupActiveNav();
    this.setupHeroDynamicBg();
    this.setupMobileMenu();
    this.setupButtonEffects();
    this.setupVideoPlayer();
    this.setupBookingForm();
    this.setupFranchiseForm();
    this.setupLightbox();
    this.setupAnalyticsTracking();
  }

  // Active Nav Detection
  setupActiveNav() {
    const rawPath = window.location.pathname.split("/").pop() || "index.html";
    const currentPath = (rawPath === "" || rawPath === "/") ? "index.html" : rawPath;
    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href") || "";
      const linkFile = href.split("#")[0].split("/").pop();
      if (linkFile === currentPath) {
        link.classList.add("active");
      } else if (currentPath === "index.html" && (linkFile === "" || linkFile === "index.html" || href.startsWith("#"))) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Gallery System
  renderGallery() {
    const grid = document.getElementById("galleryGrid");
    const tabs = document.getElementById("galleryTabs");
    if (!grid || !tabs) return;

    const categories = [
      { id: "all", name: "All Salon Views" },
      { id: "interior", name: "Styling & Foyer" },
      { id: "wash", name: "Wash & Head Spa" },
      { id: "bridal", name: "VIP Bridal Suite" }
    ];

    tabs.innerHTML = categories.map(cat => `
      <button class="service-tab-btn ${cat.id === this.currentGalleryFilter ? 'active' : ''}" data-gallery-cat="${cat.id}">
        ${cat.name}
      </button>
    `).join("");

    tabs.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const cat = e.currentTarget.dataset.galleryCat;
        tabs.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        this.currentGalleryFilter = cat;
        this.filterGalleryCards(cat);
      });
    });

    this.filterGalleryCards(this.currentGalleryFilter);
  }

  filterGalleryCards(cat) {
    const grid = document.getElementById("galleryGrid");
    if (!grid) return;

    const filtered = cat === "all"
      ? SALON_DATA.salonViews
      : SALON_DATA.salonViews.filter(v => v.category === cat);

    grid.innerHTML = filtered.map(view => `
      <div class="gallery-card" tabindex="0" role="button" aria-label="View photo of ${view.title}" data-img="${view.image}" data-title="${view.title}" data-desc="${view.caption}">
        <img src="${view.image}" alt="${view.title}" class="gallery-img" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-tag">${view.categoryName}</span>
          <h4 class="gallery-title">${view.title}</h4>
          <p class="gallery-desc">${view.caption}</p>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll(".gallery-card").forEach(card => {
      const activate = () => this.openLightbox(card.dataset.img, card.dataset.title, card.dataset.desc, card);
      card.addEventListener("click", activate);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  // Lightbox with Accessible Dialog & Focus Management
  setupLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (!lightbox) return;

    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Salon View Photo Preview");

    const closeBtn = lightbox.querySelector(".lightbox-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeLightbox());
    }

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) this.closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        this.closeLightbox();
      }
    });

    // Lightbox focus trap
    lightbox.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(lightbox.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled);
      if (!focusables.length) return;
      if (e.shiftKey && document.activeElement === focusables[0]) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === focusables[focusables.length - 1]) {
        e.preventDefault();
        focusables[0].focus();
      }
    });

    // Connect Instagram & Studio preview tiles to open full photo in Lightbox
    document.querySelectorAll(".insta-tile").forEach(tile => {
      const activate = (e) => {
        if (e) e.preventDefault();
        const img = tile.dataset.img || tile.querySelector("img")?.getAttribute("src") || "";
        const title = tile.dataset.title || tile.querySelector("img")?.getAttribute("alt") || "Salon Studio View";
        const desc = tile.dataset.desc || "Authentic salon interior view at Magic Scissors Studio Salons, Nashik.";
        this.openLightbox(img, title, desc, tile);
      };
      tile.addEventListener("click", activate);
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate(e);
        }
      });
    });
  }

  openLightbox(imgUrl, title, desc, triggerEl = null) {
    const lightbox = document.getElementById("galleryLightbox");
    if (!lightbox) return;

    this.lastLightboxTrigger = triggerEl || document.activeElement;

    const imgEl = lightbox.querySelector(".lightbox-img");
    const titleEl = lightbox.querySelector(".lightbox-title");
    const descEl = lightbox.querySelector(".lightbox-desc");

    if (imgEl) {
      imgEl.alt = title || "Magic Scissors Salon View";
      imgEl.onerror = () => {
        imgEl.src = "assets/images/salon_interior.jpg";
      };
      imgEl.src = imgUrl;
    }
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";

    const closeBtn = lightbox.querySelector(".lightbox-close");
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
  }

  closeLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (!lightbox) return;
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
    if (this.lastLightboxTrigger && typeof this.lastLightboxTrigger.focus === "function") {
      this.lastLightboxTrigger.focus();
    }
  }

  // Packages
  renderPackages() {
    const container = document.getElementById("packagesGrid");
    if (!container) return;

    container.innerHTML = SALON_DATA.packages.map((pkg, idx) => `
      <div class="package-card glass-card ${idx === 1 ? 'highlighted' : ''}">
        <span class="package-badge">${pkg.badge}</span>
        <h3 class="font-serif" style="font-size: 1.5rem; margin-top: 8px;">${pkg.title}</h3>
        <div class="package-price-box">
          <span class="package-price-val">${pkg.price}</span>
          <span class="package-orig-val">${pkg.origPrice}</span>
        </div>
        <ul class="package-features-list">
          ${pkg.features.map(f => `<li class="package-feature-item">${f}</li>`).join("")}
        </ul>
        <a href="https://wa.me/${SALON_DATA.brand.whatsappClean}?text=${encodeURIComponent('Hello Magic Scissors! I would like to book the "' + pkg.title + '" package (' + pkg.price + ').')}" target="_blank" rel="noopener noreferrer" class="btn ${idx === 1 ? 'btn-gold' : 'btn-outline-gold'}">
          Book Package via WhatsApp
        </a>
      </div>
    `).join("");
  }

  // Testimonials
  renderTestimonials() {
    const container = document.getElementById("testimonialsGrid");
    if (!container) return;

    container.innerHTML = SALON_DATA.testimonials.map(t => `
      <div class="testimonial-card glass-card">
        <div>
          <div class="testimonial-stars">★★★★★</div>
          <p class="testimonial-quote">"${t.quote}"</p>
        </div>
        <div class="testimonial-author-row">
          <div class="testimonial-avatar">${t.name.charAt(0)}</div>
          <div>
            <h5 class="testimonial-name">${t.name}</h5>
            <span class="testimonial-role">${t.role} • <span style="color: var(--accent-light);">${t.service}</span></span>
          </div>
        </div>
      </div>
    `).join("");
  }

  // Booking Select Dropdown
  populateBookingSelect() {
    const select = document.getElementById("bookingServiceSelect");
    if (!select) return;

    select.innerHTML = `
      <option value="" disabled selected>Choose Preferred Service...</option>
      ${SALON_DATA.services.map(s => `
        <option value="${s.id}">${s.title}</option>
      `).join("")}
    `;

    // Preselect service if query param exists (e.g. contact.html?service=hair-cut)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceParam = urlParams.get("service");
      if (serviceParam) {
        select.value = serviceParam;
      }
    } catch (e) {
      console.warn("Could not parse url query params:", e);
    }
  }

  // Dynamic Salon Views Hero Background Controller
  setupHeroDynamicBg() {
    const container = document.getElementById("heroDynamicBg");
    if (!container) return;

    const slides = container.querySelectorAll(".hero-bg-slide");
    if (!slides.length) return;

    const titleEl = document.getElementById("heroCurrentViewTitle");
    const counterEl = document.getElementById("heroViewCounter");
    const progressFill = document.getElementById("heroViewProgressFill");
    const prevBtn = document.getElementById("heroPrevViewBtn");
    const nextBtn = document.getElementById("heroNextViewBtn");

    let currentIndex = 0;
    const total = slides.length;
    const intervalTime = 5500; // 5.5s per salon view slide
    let progressStartTime = null;
    let animFrame = null;
    let isPaused = false;

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add("active");
        } else {
          slide.classList.remove("active");
        }
      });

      const activeSlide = slides[index];
      const title = activeSlide.dataset.title || `Salon View ${index + 1}`;
      if (titleEl) {
        titleEl.style.opacity = "0";
        setTimeout(() => {
          titleEl.textContent = title;
          titleEl.style.opacity = "1";
        }, 180);
      }
      if (counterEl) {
        counterEl.textContent = `${index + 1}/${total}`;
      }
      startProgress();
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % total;
      showSlide(currentIndex);
    };

    const prevSlide = () => {
      currentIndex = (currentIndex - 1 + total) % total;
      showSlide(currentIndex);
    };

    const updateProgress = (timestamp) => {
      if (isPaused) {
        animFrame = requestAnimationFrame(updateProgress);
        return;
      }
      if (!progressStartTime) progressStartTime = timestamp;
      const elapsed = timestamp - progressStartTime;
      const pct = Math.min(100, (elapsed / intervalTime) * 100);
      if (progressFill) progressFill.style.width = `${pct}%`;

      if (elapsed < intervalTime) {
        animFrame = requestAnimationFrame(updateProgress);
      } else {
        nextSlide();
      }
    };

    const startProgress = () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      progressStartTime = null;
      if (progressFill) progressFill.style.width = "0%";
      animFrame = requestAnimationFrame(updateProgress);
    };

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
      });
    }

    // Keyboard arrow navigation on controls & pause on focus/hover
    const pill = document.getElementById("heroViewPill");
    if (pill) {
      pill.setAttribute("tabindex", "0");
      pill.setAttribute("role", "region");
      pill.setAttribute("aria-label", "Salon views dynamic gallery");

      pill.addEventListener("mouseenter", () => { isPaused = true; });
      pill.addEventListener("mouseleave", () => {
        isPaused = false;
        progressStartTime = null;
      });

      pill.addEventListener("focusin", () => { isPaused = true; });
      pill.addEventListener("focusout", () => {
        isPaused = false;
        progressStartTime = null;
      });

      pill.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextSlide();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSlide();
        }
      });
    }

    // Start on first slide
    showSlide(0);
  }

  // Header Scroll
  setupHeaderScroll() {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, { passive: true });
  }

  // Mobile Menu — with backdrop, click-outside close, Escape close & ARIA state
  setupMobileMenu() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const navMenu = document.getElementById("navMenu");
    if (!menuBtn || !navMenu) return;

    // Inject a single backdrop element (only once)
    let backdrop = document.getElementById("navDrawerBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "navDrawerBackdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }

    // Inject a ✕ close button at top of drawer (only once)
    if (!navMenu.querySelector(".nav-drawer-close")) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "nav-drawer-close";
      closeBtn.setAttribute("type", "button");
      closeBtn.setAttribute("aria-label", "Close navigation menu");
      closeBtn.textContent = "✕";
      navMenu.prepend(closeBtn);
      closeBtn.addEventListener("click", () => closeDrawer());
    }

    const openDrawer = () => {
      navMenu.classList.add("open");
      backdrop.classList.add("active");
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Close navigation");
      // Focus first link inside drawer
      const firstLink = navMenu.querySelector(".nav-link");
      if (firstLink) firstLink.focus();
    };

    const closeDrawer = () => {
      navMenu.classList.remove("open");
      backdrop.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open navigation");
      menuBtn.focus();
    };

    // Initialize ARIA state
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open navigation");
    menuBtn.setAttribute("aria-controls", "navMenu");

    menuBtn.addEventListener("click", () => {
      if (navMenu.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    // Close on nav link click
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => closeDrawer());
    });

    // Close on backdrop click
    backdrop.addEventListener("click", () => closeDrawer());

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        closeDrawer();
      }
    });

    // Auto-close drawer if window is resized above breakpoint
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1180 && navMenu.classList.contains("open")) {
        closeDrawer();
      }
    });
  }

  // Button Ripple & Fade-out Response
  setupButtonEffects() {
    document.querySelectorAll(".btn").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.classList.add("btn-fade-effect");
        setTimeout(() => btn.classList.remove("btn-fade-effect"), 350);
      });
    });
  }

  // Video Player Controls with State Sync & Graceful Media Fallback
  setupVideoPlayer() {
    const video = document.getElementById("salonVideo");
    const playBtn = document.getElementById("videoPlayToggle");
    const muteBtn = document.getElementById("videoMuteToggle");
    const container = document.getElementById("videoPlayerContainer");
    if (!video) return;

    const updatePlayUI = () => {
      if (!playBtn) return;
      if (video.paused) {
        playBtn.innerHTML = `<span>▶</span> Play Ambience Tour`;
        playBtn.setAttribute("aria-label", "Play video tour");
      } else {
        playBtn.innerHTML = `<span>⏸</span> Pause Tour`;
        playBtn.setAttribute("aria-label", "Pause video tour");
      }
    };

    const updateMuteUI = () => {
      if (!muteBtn) return;
      if (video.muted) {
        muteBtn.innerHTML = `<span>🔇</span> Unmute Audio`;
        muteBtn.setAttribute("aria-label", "Unmute audio");
      } else {
        muteBtn.innerHTML = `<span>🔊</span> Mute Audio`;
        muteBtn.setAttribute("aria-label", "Mute audio");
      }
    };

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        video.muted = !video.muted;
      });
    }

    video.addEventListener("play", updatePlayUI);
    video.addEventListener("pause", updatePlayUI);
    video.addEventListener("volumechange", updateMuteUI);

    // Fallback if video file is missing or blocked by browser
    video.addEventListener("error", () => {
      console.warn("Salon walkthrough video source not accessible, engaging high-res photo fallback.");
      if (container && !container.querySelector(".video-fallback-banner")) {
        const fallback = document.createElement("div");
        fallback.className = "video-fallback-banner";
        fallback.style.cssText = "position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(13,16,23,0.85); border: 1px solid rgba(200,109,74,0.3); border-radius: var(--radius-sm); padding: 12px 18px; color: var(--accent-light); font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between; backdrop-filter: blur(10px); z-index: 5;";
        fallback.innerHTML = `<span>✨ 4K Ambient Studio Tour (Walk-ins & Guided Tours Available Onsite)</span><a href="contact.html" class="btn btn-gold" style="padding: 6px 14px; font-size: 0.78rem;">Visit Studio</a>`;
        container.appendChild(fallback);
      }
    });

    updatePlayUI();
    updateMuteUI();
  }

  // Analytics Lead Tracking
  setupAnalyticsTracking() {
    // WhatsApp click tracking
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      link.addEventListener("click", () => {
        supabaseService.trackLeadEvent("whatsapp_click", { target: link.href });
      });
    });

    // Dialpad phone call tracking
    document.querySelectorAll('a[href*="tel:"]').forEach(link => {
      link.addEventListener("click", () => {
        supabaseService.trackLeadEvent("dialpad_call", { phone: link.href });
      });
    });
  }

  // Booking Form with Client Validation, Submitting State, Supabase & WhatsApp Auto-formatting
  setupBookingForm() {
    const form = document.getElementById("appointmentForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.clientName.value.trim();
      const phone = form.clientPhone.value.trim();
      const serviceId = form.bookingServiceSelect.value;
      const date = form.bookingDate.value;
      const time = form.bookingTime.value;
      const notes = form.bookingNotes.value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');

      // Client validation
      if (!name || name.length < 2) {
        alert("Please enter your full name.");
        form.clientName.focus();
        return;
      }

      const cleanPhone = phone.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 10) {
        alert("Please enter a valid 10-digit mobile number.");
        form.clientPhone.focus();
        return;
      }

      if (!serviceId) {
        alert("Please select your preferred service.");
        form.bookingServiceSelect.focus();
        return;
      }

      if (!date) {
        alert("Please select your preferred appointment date.");
        form.bookingDate.focus();
        return;
      }

      const service = SALON_DATA.services.find(s => s.id === serviceId);
      const serviceName = service ? service.title : "Custom Consultation";

      // Prevent duplicate submission & show loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>⏳</span> Securing Your Appointment...`;
      }

      try {
        // 1. Store appointment in Supabase database & local reactive store
        const record = await supabaseService.saveAppointment({
          clientName: name,
          clientPhone: phone,
          serviceId: serviceId,
          serviceName: serviceName,
          preferredDate: date,
          timeSlot: time,
          notes: notes
        });

        // 2. Prepare structured WhatsApp message
        const message = `*Magic Scissors - New Appointment Request*%0A%0A` +
          `• *Booking Reference:* ${record.id}%0A` +
          `• *Client Name:* ${encodeURIComponent(name)}%0A` +
          `• *Contact Phone:* ${encodeURIComponent(phone)}%0A` +
          `• *Selected Service:* ${encodeURIComponent(serviceName)}%0A` +
          `• *Preferred Date:* ${encodeURIComponent(date)}%0A` +
          `• *Preferred Time:* ${encodeURIComponent(time)}%0A` +
          (notes ? `• *Special Notes:* ${encodeURIComponent(notes)}%0A` : "") +
          `%0APlease confirm my appointment slot!`;

        const waUrl = `https://wa.me/${SALON_DATA.brand.whatsappClean}?text=${message}`;

        // Open WhatsApp
        window.open(waUrl, "_blank");

        // Show friendly confirmation feedback
        const feedback = document.getElementById("bookingConfirmationMsg");
        if (feedback) {
          feedback.innerHTML = `✓ Appointment <strong>#${record.id}</strong> recorded! Our desk has prepared your WhatsApp confirmation ticket.`;
          feedback.style.display = "block";
          form.reset();
          setTimeout(() => {
            feedback.style.display = "none";
          }, 9000);
        }
      } catch (err) {
        alert("Could not process appointment. Please contact our desk directly at +91 99601 35849.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `Confirm Appointment & Sync via WhatsApp`;
        }
      }
    });
  }

  // Franchise Form Handler with Validation & Duplicate Prevention
  setupFranchiseForm() {
    const fForm = document.getElementById("franchiseForm");
    if (!fForm) return;

    fForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = fForm.fName?.value.trim() || "";
      const phone = fForm.fPhone?.value.trim() || "";
      const city = fForm.fCity?.value.trim() || "";
      const model = fForm.fModel?.value || "Studio Boutique";
      const notes = fForm.fNotes?.value.trim() || "";
      const submitBtn = fForm.querySelector('button[type="submit"]');

      if (!name || name.length < 2) {
        alert("Please enter your name.");
        return;
      }
      if (phone.replace(/[^0-9]/g, "").length < 10) {
        alert("Please enter a valid mobile number.");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Connecting with Franchise Desk...";
      }

      const msg = `*Magic Scissors - Franchise Partnership Inquiry*%0A%0A` +
        `• *Partner Name:* ${encodeURIComponent(name)}%0A` +
        `• *Mobile:* ${encodeURIComponent(phone)}%0A` +
        `• *Target City:* ${encodeURIComponent(city)}%0A` +
        `• *Preferred Model:* ${encodeURIComponent(model)}%0A` +
        (notes ? `• *Notes:* ${encodeURIComponent(notes)}%0A` : "") +
        `%0APlease share the franchise disclosure and investment prospectus!`;

      window.open(`https://wa.me/${SALON_DATA.brand.whatsappClean}?text=${msg}`, "_blank");

      const msgBox = document.getElementById("franchiseConfirmMsg");
      if (msgBox) {
        msgBox.style.display = "block";
        fForm.reset();
        setTimeout(() => {
          msgBox.style.display = "none";
        }, 9000);
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Franchise Inquiry via WhatsApp";
        }
      }, 1500);
    });
  }
}

// Launch on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.magicScissorsApp = new MagicScissorsApp();
});
