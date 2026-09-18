/**
 * Magic Scissors - Main Application Core (Supabase Enhanced)
 */
import './cinema-ambient.js';
import { SALON_DATA } from './data/salon-data.js';
import { ServicesManager } from './services.js';
import { supabaseService } from './supabase-client.js';
import { AuthManager } from './auth.js';
import { ConciergeDashboard } from './admin-dashboard.js';
import { ButtonLoader, FormValidator, ToastManager, Skeleton, EmptyState, ErrorClassifier, StylePhotoUploader } from './ui-feedback.js';

class MagicScissorsApp {
  constructor() {
    this.servicesMgr = null;
    this.authMgr = null;
    this.conciergeDashboard = null;
    this.currentGalleryFilter = "all";
    this.stylePhotoUploader = null;
    this.galleryTimeout = null;
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

  // Gallery System with Skeletons & Empty States
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

    if (this.galleryTimeout) clearTimeout(this.galleryTimeout);

    // 1. Show high-fidelity gallery skeletons
    Skeleton.renderGalleryGrid(grid, 6);

    // 2. Smooth transition to loaded cards
    this.galleryTimeout = setTimeout(() => {
      const filtered = cat === "all"
        ? SALON_DATA.salonViews
        : SALON_DATA.salonViews.filter(v => v.category === cat);

      if (!filtered || filtered.length === 0) {
        EmptyState.render(grid, {
          icon: "🖼️",
          title: "No Photos Available",
          description: "Explore our studio spaces through our gallery or take a video tour.",
          actionText: "View All Photos",
          onAction: () => {
            const allBtn = document.getElementById("galleryTabs")?.querySelector('[data-gallery-cat="all"]');
            allBtn?.click();
          }
        });
        return;
      }

      const isAll = cat === "all";
      grid.innerHTML = filtered.map((view, idx) => {
        const isFeatured = isAll && (idx === 0 || idx === filtered.length - 1);
        const isAboveFold = idx < 2;
        return `
          <div class="gallery-card ${isFeatured ? 'featured' : ''}" tabindex="0" role="button" aria-label="View photo of ${view.title}" data-img="${view.image}" data-title="${view.title}" data-desc="${view.caption}">
            <img src="${view.image}" alt="${view.title}" class="gallery-img"
                 loading="${isAboveFold ? 'eager' : 'lazy'}"
                 decoding="async"
                 ${isAboveFold ? 'fetchpriority="high"' : ''}
                 onload="this.classList.add('is-loaded')"
                 onerror="this.onerror=null;this.src='assets/images/salon_interior.jpg';this.classList.add('is-loaded');">
            <div class="gallery-overlay">
              <span class="gallery-tag">${view.categoryName}</span>
              <h4 class="gallery-title">${view.title}</h4>
              <p class="gallery-desc">${view.caption}</p>
            </div>
          </div>
        `;
      }).join("");

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
    }, 160);
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

    const modalContainer = lightbox.querySelector(".modal-container") || lightbox;
    const imgEl = lightbox.querySelector(".lightbox-img");
    const titleEl = lightbox.querySelector(".lightbox-title");
    const descEl = lightbox.querySelector(".lightbox-desc");

    // Add high-resolution loading overlay if not present
    let loadingOverlay = lightbox.querySelector(".lightbox-loading-overlay");
    if (!loadingOverlay) {
      loadingOverlay = document.createElement("div");
      loadingOverlay.className = "lightbox-loading-overlay";
      loadingOverlay.innerHTML = `
        <span class="ms-spinner" style="width: 28px; height: 28px; border-width: 3px; border-top-color: #D49A7E;" aria-hidden="true"></span>
        <span style="color: #FAF8F5; font-size: 0.85rem; font-family: var(--font-sans); letter-spacing: 0.02em;">Loading photo...</span>
      `;
      modalContainer.style.position = "relative";
      modalContainer.appendChild(loadingOverlay);
    }

    // Add error fallback container if not present
    let errorBox = lightbox.querySelector(".lightbox-error-box");
    if (!errorBox) {
      errorBox = document.createElement("div");
      errorBox.className = "lightbox-error-box";
      errorBox.innerHTML = `
        <span aria-hidden="true" style="font-size: 2.2rem; margin-bottom: 12px;">🖼️</span>
        <h4 class="font-serif" style="color: #FAF8F5; font-size: 1.25rem; margin-bottom: 6px;">Image Preview Unavailable</h4>
        <p style="color: #9CA3AF; font-size: 0.88rem; max-width: 320px; margin-bottom: 18px; line-height: 1.5;">We couldn't preview this high-resolution photo. Please check your connection or try again.</p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
          <button type="button" class="btn btn-gold btn-sm lightbox-retry-btn">Retry Loading</button>
          <button type="button" class="btn btn-outline-gold btn-sm lightbox-fallback-btn">View Standard Photo</button>
        </div>
      `;
      modalContainer.appendChild(errorBox);
    }

    // Reset states
    errorBox.style.display = "none";
    loadingOverlay.classList.remove("loaded");

    if (imgEl) {
      imgEl.style.display = "block";
      imgEl.style.opacity = "0";
      imgEl.style.transition = "opacity 0.35s ease";
      imgEl.alt = title || "Magic Scissors Salon View";

      imgEl.onload = () => {
        loadingOverlay.classList.add("loaded");
        imgEl.style.opacity = "1";
        errorBox.style.display = "none";
      };

      imgEl.onerror = () => {
        loadingOverlay.classList.add("loaded");
        imgEl.style.display = "none";
        errorBox.style.display = "flex";

        const retryBtn = errorBox.querySelector(".lightbox-retry-btn");
        const fallbackBtn = errorBox.querySelector(".lightbox-fallback-btn");

        if (retryBtn) {
          retryBtn.onclick = (e) => {
            e.preventDefault();
            errorBox.style.display = "none";
            loadingOverlay.classList.remove("loaded");
            imgEl.style.display = "block";
            imgEl.style.opacity = "0";
            const separator = imgUrl.includes("?") ? "&" : "?";
            imgEl.src = `${imgUrl}${separator}_t=${Date.now()}`;
          };
        }

        if (fallbackBtn) {
          fallbackBtn.onclick = (e) => {
            e.preventDefault();
            errorBox.style.display = "none";
            loadingOverlay.classList.remove("loaded");
            imgEl.style.display = "block";
            imgEl.style.opacity = "0";
            imgEl.src = "assets/images/salon_styling_arena.jpg";
          };
        }
      };

      imgEl.src = imgUrl;

      // Handle cached image
      if (imgEl.complete && imgEl.naturalWidth > 0) {
        loadingOverlay.classList.add("loaded");
        imgEl.style.opacity = "1";
      }
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
        <a href="https://wa.me/${SALON_DATA.brand.whatsappClean}?text=${encodeURIComponent('Hi! I\'d like to book the "' + pkg.title + '" package (' + pkg.price + ').')}" target="_blank" rel="noopener noreferrer" class="btn ${idx === 1 ? 'btn-gold' : 'btn-outline-gold'}">
          Reserve via WhatsApp
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
            <span class="testimonial-role" style="color: var(--accent-light);">${t.service}</span>
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
      <option value="" disabled selected>Select a Service...</option>
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

  // Sidebar Navigation & Quick-Actions Drawer
  setupMobileMenu() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const drawer = document.getElementById("navDrawer") || document.getElementById("navMenu");
    if (!menuBtn || !drawer) return;

    // Use existing backdrop or create if not in DOM
    let backdrop = document.getElementById("navDrawerBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "navDrawerBackdrop";
      backdrop.className = "nav-drawer-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }

    const closeBtn = document.getElementById("navDrawerCloseBtn") || drawer.querySelector(".nav-drawer-close");

    const openDrawer = () => {
      drawer.classList.add("open");
      backdrop.classList.add("active");
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Close navigation");
      document.body.style.overflow = "hidden";
      const firstLink = drawer.querySelector(".drawer-nav-link, .nav-link");
      if (firstLink) firstLink.focus();
    };

    const closeDrawer = () => {
      drawer.classList.remove("open");
      backdrop.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open navigation");
      document.body.style.overflow = "";
      menuBtn.focus();
    };

    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open navigation");
    menuBtn.setAttribute("aria-controls", drawer.id);

    menuBtn.addEventListener("click", () => {
      if (drawer.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeDrawer());
    }

    // Close on any navigation link click inside drawer
    drawer.querySelectorAll(".drawer-nav-link, .nav-link").forEach(link => {
      link.addEventListener("click", () => closeDrawer());
    });

    // Close on backdrop click
    backdrop.addEventListener("click", () => closeDrawer());

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });

    // Auto-close drawer if window is resized above breakpoint
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1180 && drawer.classList.contains("open")) {
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

    const playIcon = `<svg class="video-ctrl-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseIcon = `<svg class="video-ctrl-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    const mutedIcon = `<svg class="video-ctrl-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
    const soundIcon = `<svg class="video-ctrl-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

    const updatePlayUI = () => {
      if (!playBtn) return;
      if (video.paused) {
        playBtn.innerHTML = playIcon;
        playBtn.setAttribute("aria-label", "Play video tour");
        playBtn.setAttribute("title", "Play");
      } else {
        playBtn.innerHTML = pauseIcon;
        playBtn.setAttribute("aria-label", "Pause video tour");
        playBtn.setAttribute("title", "Pause");
      }
    };

    const updateMuteUI = () => {
      if (!muteBtn) return;
      if (video.muted) {
        muteBtn.innerHTML = mutedIcon;
        muteBtn.setAttribute("aria-label", "Unmute audio");
        muteBtn.setAttribute("title", "Unmute");
      } else {
        muteBtn.innerHTML = soundIcon;
        muteBtn.setAttribute("aria-label", "Mute audio");
        muteBtn.setAttribute("title", "Mute");
      }
    };

    if (playBtn) {
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
      });
    }

    video.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

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

  // Booking Form with Client Validation, Submitting State, Supabase, Photo Upload & WhatsApp Auto-formatting
  setupBookingForm() {
    const form = document.getElementById("appointmentForm");
    if (!form) return;

    // Automatic Appointment Date Validation: Minimum date is today
    const today = new Date().toISOString().split("T")[0];
    if (form.bookingDate) {
      form.bookingDate.min = today;
    }

    // Initialize Optional Hair / Style Inspiration Photo Uploader
    const dropzoneContainer = document.getElementById("styleInspirationDropzone");
    if (dropzoneContainer) {
      this.stylePhotoUploader = StylePhotoUploader.init(dropzoneContainer);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Validate form fields
      const validation = FormValidator.validateAppointmentForm(form);
      if (!validation.isValid) {
        ToastManager.warning("Please complete the required appointment details.");
        return;
      }

      const { clientName, clientPhone, serviceId, preferredDate, timeSlot, notes } = validation.data;
      const submitBtn = form.querySelector('button[type="submit"]');

      const service = SALON_DATA.services.find(s => s.id === serviceId);
      const serviceName = service ? service.title : "Custom Consultation";

      // Check for attached style photo
      const attachedPhoto = this.stylePhotoUploader ? this.stylePhotoUploader.getFile() : null;
      let finalNotes = notes;
      if (attachedPhoto) {
        finalNotes = finalNotes ? `${finalNotes} [Style Photo: ${attachedPhoto.name}]` : `[Style Photo: ${attachedPhoto.name}]`;
      }

      // 2. Prevent duplicate submission & show loading
      ButtonLoader.start(submitBtn, "Saving Appointment...");

      try {
        // 3. Store appointment in Supabase database & local reactive store
        const record = await supabaseService.saveAppointment({
          clientName: clientName,
          clientPhone: clientPhone,
          serviceId: serviceId,
          serviceName: serviceName,
          preferredDate: preferredDate,
          timeSlot: timeSlot,
          notes: finalNotes
        });

        // 4. Prepare structured WhatsApp message
        const message = `*Magic Scissors - New Appointment Request*%0A%0A` +
          `• *Booking Reference:* ${record.id}%0A` +
          `• *Client Name:* ${encodeURIComponent(clientName)}%0A` +
          `• *Contact Phone:* ${encodeURIComponent(clientPhone)}%0A` +
          `• *Selected Service:* ${encodeURIComponent(serviceName)}%0A` +
          `• *Preferred Date:* ${encodeURIComponent(preferredDate)}%0A` +
          `• *Preferred Time:* ${encodeURIComponent(timeSlot)}%0A` +
          (attachedPhoto ? `• *Inspiration Photo:* Attached (${encodeURIComponent(attachedPhoto.name)})%0A` : "") +
          (notes ? `• *Special Notes:* ${encodeURIComponent(notes)}%0A` : "") +
          `%0APlease confirm my appointment slot!`;

        const waUrl = `https://wa.me/${SALON_DATA.brand.whatsappClean}?text=${message}`;

        // Open WhatsApp
        window.open(waUrl, "_blank");

        // 5. Toast notification & inline success banner
        ToastManager.success(`Appointment #${record.id} saved.`, {
          title: "Appointment Requested"
        });

        const feedback = document.getElementById("bookingConfirmationMsg");
        if (feedback) {
          feedback.innerHTML = `✓ Appointment <strong>#${record.id}</strong> saved. We have prepared your WhatsApp confirmation request.`;
          feedback.style.display = "block";
          form.reset();
          if (this.stylePhotoUploader) {
            this.stylePhotoUploader.reset();
          }
          if (form.bookingDate) {
            form.bookingDate.min = today;
          }
          setTimeout(() => {
            feedback.style.display = "none";
          }, 9000);
        }
      } catch (err) {
        console.error("Booking error:", err);
        const classified = ErrorClassifier.classify(err);
        ToastManager.error(classified.userMessage, {
          title: "Notice",
          retryText: "Try Again",
          onRetry: () => form.requestSubmit()
        });
      } finally {
        ButtonLoader.stop(submitBtn);
      }
    });
  }

  // Franchise Form Handler with Validation & Duplicate Prevention
  setupFranchiseForm() {
    const fForm = document.getElementById("franchiseForm");
    if (!fForm) return;

    fForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const validation = FormValidator.validateFranchiseForm(fForm);
      if (!validation.isValid) {
        ToastManager.warning("Please verify your franchise inquiry details.");
        return;
      }

      const { name, phone, city, model, notes } = validation.data;
      const submitBtn = fForm.querySelector('button[type="submit"]');

      ButtonLoader.start(submitBtn, "Preparing Inquiry...");

      try {
        const msg = `*Magic Scissors - Franchise Partnership Inquiry*%0A%0A` +
          `• *Partner Name:* ${encodeURIComponent(name)}%0A` +
          `• *Mobile:* ${encodeURIComponent(phone)}%0A` +
          `• *Target City:* ${encodeURIComponent(city)}%0A` +
          `• *Preferred Model:* ${encodeURIComponent(model)}%0A` +
          (notes ? `• *Notes:* ${encodeURIComponent(notes)}%0A` : "") +
          `%0APlease share the franchise disclosure and investment prospectus!`;

        window.open(`https://wa.me/${SALON_DATA.brand.whatsappClean}?text=${msg}`, "_blank");

        ToastManager.success("Franchise inquiry prepared. Opening WhatsApp.");

        const msgBox = document.getElementById("franchiseConfirmMsg");
        if (msgBox) {
          msgBox.style.display = "block";
          fForm.reset();
          setTimeout(() => {
            msgBox.style.display = "none";
          }, 9000);
        }
      } catch (err) {
        const classified = ErrorClassifier.classify(err);
        ToastManager.error(classified.userMessage);
      } finally {
        setTimeout(() => {
          ButtonLoader.stop(submitBtn);
        }, 600);
      }
    });
  }
}

// Launch on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.magicScissorsApp = new MagicScissorsApp();
});
